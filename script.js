/*
* Copyright (c) 2016, Jan Brohl <janbrohl@t-online.de>
* All rights reserved.
*/
"use strict";

var mode;

var install_template;

function get_val(id) {
    return $("#" + id).val().trim();
}

function update_mode(new_mode) {
    var new_autofill = modes_autofill[new_mode]
    for (var name of mandatory_fields) {
        $("#" + name).attr("required", "required");

        if (new_autofill.includes(name)) {
            $(`#mandatory_fields > #${name}_container`).detach().appendTo('#optional_fields')
        } else {
            $(`#optional_fields > #${name}_container`).detach().appendTo('#mandatory_fields')
        }
    }
    // Hide the optional fields section if empty
    if ($('#optional_fields').children().length > 0) {
        $('#optional_fields_header').show();
    } else {
        $('#optional_fields_header').hide();
        $('#optional_fields_container').hide();
    }
    if (mode) {
        var old_mode = mode;
        for (var name of modes_autofill[old_mode]) {
            $("#" + name.replace('.', '_')).removeClass("filled-by-netkan");
        }
    }
    for (var name of new_autofill) {
        $("#" + name.replace('.', '_')).removeAttr("required").addClass("filled-by-netkan");
    }
    mode = new_mode;
    switch_add_vref();
}

function host_error(err) {
    $("#json_output").text('');
    $("#validation_errors").text(err);
    $("#failure_box").show();
    $("#success_box").hide();
}

function proceed_spacedock() {
    update_mode("spacedock");
    var sd_id = get_val("spacedock_id");
    $("#kref").val("#/ckan/spacedock/" + sd_id);
    if (!sd_id) {
        host_error("SpaceDock ID is missing");
        $("#spacedock_id").focus();
    } else {
        generate_netkan();
    }
}

function proceed_github() {
    update_mode("github");
    var gh_user = get_val("github_user");
    var gh_repo = get_val("github_repo");
    var k = "#/ckan/github/" + gh_user + "/" + gh_repo;
    var fr = get_val("github_filter_regexp");
    if (fr && fr.length) {
        k = k + "/asset_match/" + fr;
    }
    $("#kref").val(k);
    if (!gh_user) {
        host_error("GitHub user is missing");
        $("#github_user").focus();
    } else if (!gh_repo) {
        host_error("GitHub repo is missing");
    } else {
        generate_netkan();
    }
}

function proceed_http() {
    update_mode("http");
    var h_url = get_val("http_url");
    $("#kref").val("#/ckan/http/" + h_url);
    if (!h_url) {
        host_error("URL is missing");
        $("#http_url").focus();
    } else {
        generate_netkan();
    }
}

function proceed_kref() {
    var sd = "#/ckan/spacedock/";
    var gh = "#/ckan/github/";
    var h = "#/ckan/http/";

    var k = get_val("kref_kref");
    if (k.startsWith(sd)) {
        $("#spacedock_id").val(k.substring(sd.length).replace("/", ""));
        return proceed_spacedock();
    } else if (k.startsWith(gh)) {
        var ghs = k.substring(gh.length).split("/", 4);
        $("#github_user").val(ghs[0]);
        $("#github_repo").val(ghs[1]);
        $("#github_filter_regexp").val(ghs[3]);
        return proceed_github();
    } else if (k.startsWith(h)) {
        $("#http_url").val(k.substring(h.length));
        return proceed_http();
    }
    $("#kref").val(k);
    if (!k) {
        host_error("kref is missing");
        $("#kref_kref").focus();
    } else {
        generate_netkan();
    }
}

function proceed_edit() {
    $("#edit_json").focus();
    var o = jsyaml.load(get_val("edit_json"));
    var ref_fields = ["depends", "recommends", "suggests", "supports", "conflicts"];
    var not_mapped = ["resources", "install",
        "depends", "recommends", "suggests", "supports", "conflicts", "provides",
        "ksp_version", "ksp_version_min", "ksp_version_max",
        "$vref", "$kref"
    ];
    for (var key in o) {
        if (!not_mapped.includes(key)) {
            $("#" + key).val(o[key]);
        }
    }
    var res = o.resources;
    if (res) {
        for (var key in res) {
            $("#resources_" + key).val(res[key]);
        }
    }
    for (var i in ref_fields) {
        var k = ref_fields[i];
        var refa = o[k];
        if (refa) {
            var s = "";
            for (var j in refa) {
                s = s + stringify_ref(refa[j]);
            }
            $("#" + k).val(s);
        }
    }
    if (o["$vref"]) {
        $("#add_vref").attr("checked", "checked");
    } else {
        $("#add_vref").removeAttr("checked");
    }
    var ksp = { "name": "", "version": o.ksp_version, "min_version": o.ksp_version_min, "max_version": o.ksp_version_max };
    $("#ksp_version").val(stringify_ref(ksp));

    $("#kref_kref").val(o["$kref"]);
    proceed_kref();
}

function proceed_other() {
    update_mode("other");
    $("#identifier").focus();
    generate_netkan();
}

function stringify_ref(ref) {
    var s = ref.name;
    if (ref.version) {
        s = s + " ==" + ref.version;
    }
    if (ref.max_version) {
        s = s + " <=" + ref.version;
    }
    if (ref.min_version) {
        s = s + " >=" + ref.version;
    }
    return s;
}

function parse_ref_line(line) {
    if (!line) {
        return null;
    }
    var found = line.search(/[<>=]=[^<>=]+/);
    if (found == -1) {
        return { "name": line.trim() };
    }
    var entry = { "name": line.substring(0, found).trim() };
    var matches = line.match(/[<>=]=[^<>=]+/g);
    for (var j in matches) {
        var m = matches[j];
        if (m[0] == "=") {
            entry["version"] = m.substring(2);
        } else if (m[0] == "<") {
            entry["max_version"] = m.substring(2);
        } else if (m[0] == ">") {
            entry["min_version"] = m.substring(2);
        }
    }
    return entry;
}

function sets(obj, name, as_name) {
    var v = get_val(name);
    if (v && v.length) {
        if (as_name) {
            obj[as_name] = v;
        } else {
            obj[name] = v;
        }
    }
}
function seta(obj, name, as_name) {
    var v = get_val(name);
    if (v && v.length) {
        var va = v.split("\n");
        if (as_name) {
            obj[as_name] = va;
        } else {
            obj[name] = va;
        }
    }
}
function setrel(obj, name, as_name) {
    var v = get_val(name);
    if (v && v.length) {
        var va = v.split("\n");
        var entries = [];
        for (var i in va) {
            var line = va[i];
            var entry = parse_ref_line(line);
            entries.push(entry)
        }
        if (as_name) {
            obj[as_name] = entries;
        } else {
            obj[name] = entries;
        }
    }
}

function normalize_path(archive_path) {
    return archive_path.trim().replace("\\", "/");
}

function generate_netkan() {

    var o = {};

    sets(o, "identifier");
    sets(o, "name");
    sets(o, "abstract");
    seta(o, "author");
    seta(o, "license");
    if (o.license) {
        if (o.license.length == 1) {
            o.license = o.license[0];
        }
    }
    sets(o, "kref", "$kref");
    if ($("#add_vref:checked").val()) {
        o["$vref"] = "#/ckan/ksp-avc";
    }
    sets(o, "release_status");

    var resources = {};
    sets(resources, "resources_bugtracker", "bugtracker");
    sets(resources, "resources_license", "license");
    sets(resources, "resources_ci", "ci");
    sets(resources, "resources_spacedock", "spacedock");
    sets(resources, "resources_manual", "manual");
    sets(resources, "resources_homepage", "homepage");
    sets(resources, "resources_repository", "repository");
    sets(resources, "resources_x_screenshot", "x_screenshot")
    if (Object.keys(resources).length > 0) {
        o["resources"] = resources;
    }

    const tags = Array.from(document.querySelectorAll('input[type=checkbox][name=tag]:checked'),
                            e => e.value);
    if (tags.length > 0) {
        o['tags'] = tags;
    }

    var install = []
    $("#install li").each(function () {
        var v = 1;
        var file = $('[name="file"]', this).val();
        var to = $('[name="install_to"]', this).val();
        var d = { "file": normalize_path(file), "install_to": to };
        var install_as = $('[name="install_as"]', this).val();
        if (install_as && install_as.length) {
            d["as"] = install_as;
        }
        install.push(d);
    });
    if (install.length > 0) {
        o["install"] = install;
    }

    var ksp_ver_raw = get_val("ksp_version");
    var ksp_ver = parse_ref_line("ksp" + ksp_ver_raw);
    if (ksp_ver.name == "ksp") {
        if (ksp_ver.version) {
            o["ksp_version"] = ksp_ver.version;
        }
        if (ksp_ver.min_version) {
            o["ksp_version_min"] = ksp_ver.min_version;
        }
        if (ksp_ver.max_version) {
            o["ksp_version_max"] = ksp_ver.max_version;
        }
    } else if (ksp_ver_raw && ksp_ver_raw.length) {
        o["ksp_version"] = ksp_ver_raw;
    }

    seta(o, "provides");
    setrel(o, "conflicts");
    setrel(o, "depends");
    setrel(o, "recommends");
    setrel(o, "suggests");
    setrel(o, "supports");

    var uj = get_val("update_json");
    var ujo;
    try {
        ujo = jsyaml.load(uj);
    } catch (err) {
        alert("Update JSON field not applied\n\n" + err);
    }
    if (ujo) {
        for (var key in ujo) {
            o[key] = ujo[key];
        }
    }

    o["x_via"] = "Generated by Metadata Webtool";

    var dummies = {};
    var autofill = modes_autofill[mode];
    for (const field of autofill) {
        switch (field) {
            case "license":
                dummies[field] = "restricted";
                break;
            case "download":
                dummies[field] = "http://example.com";
                break;
            case "download_size":
                dummies[field] = 1;
                break;
            case "download_hash":
                dummies[field] = {};
                break;
            case "release_status":
                // Just omit this property
                break;
            default:
                dummies[field] = "any";
                break;
        }
    }
    if (o["$vref"]) {
        dummies["version"] = "any";
    }
    var dummy_filled = {spec_version: 1};
    for (var k in dummies) {
        dummy_filled[k] = dummies[k];
    }
    for (var k in o) {
        dummy_filled[k] = o[k];
    }

    var validation_result = tv4.validateMultiple(dummy_filled, ckan_schema);

    if (!validation_result.valid) {
        var e = validation_result.errors;
        $("#validation_errors").text(
            e.map(err => err.message).join('\n')
        );
        $("#failure_box").show();
        $("#success_box").hide();
    } else {
        $("#failure_box").hide();
        $("#validation_errors").text('');
        $("#success_box").show();
    }

    var data = jsyaml.dump(o);
    $("#issue_title").val(`Add ${get_val("identifier")}`);
    $("#issue_body").val("\n\n```yaml\n" + data + "\n```\n");
    $("#json_output").text(data);
}


function add_ref(name) {
    var ar = $("#add_" + name).dialog({
        autoOpen: false,
        modal: true,
        height: 300,
        width: 700,
        buttons: {
            "Add": function () {
                var li = $("#" + name);
                var new_val = (li.val() + " " + get_val("add_" + name + "_id")).replace(/\s+/g, "\n").trim();
                li.val(new_val);
                $(this).dialog("close");
            },
            "Cancel": function () {
                $(this).dialog("close");
            }
        }
    });
    var update = function () {
        var v = get_val("add_" + name + "_name");
        var i = ckan_name_to_id[v];
        if (i) {
            $("#add_" + name + "_id").val(i);
        }
    };
    $("#add_" + name + "_name").autocomplete({
        "source": ckan_names
    }).on("autocompleteclose", update);
    $("#add_" + name + "_id").autocomplete({
        "source": ckan_ids
    });
    $("#add_" + name + "_button").on("click", function () {
        ar.dialog("open");
        $("#add_" + name + " input").val("");
    });
}

function switch_add_vref() {
    if ($("#add_vref:checked").val() || modes_autofill[mode].includes("version")) {
        $("#version").addClass("filled-by-netkan");
    } else {
        $("#version").removeClass("filled-by-netkan");
    }
}

function reset_fields() {
    for (var ident of [
        '#spacedock_id',
        '#github_user',
        '#github_repo',
        '#github_filter_regexp',
        '#http_url',
        '#kref_kref',
        '#edit_json',

        '#identifier',
        '#add_vref',
        '#name',
        '#author',
        '#version',
        '#ksp_version',
        '#license',
        '#download',

        '#resources_homepage',
        '#resources_repository',
        '#resources_ci',
        '#resources_spacedock',
        '#resources_manual',
        '#resources_license',
        '#resources_bugtracker',
        '#resources_x_screenshot',

        '#depends',
        '#recommends',
        '#suggests',
        '#supports',
        '#conflicts',

        '#release_status',
        '#provides',

        '#kref',
    ]) {
        $(ident).val('');
    }
    $('input[name="tag"]').prop('checked', false);
    var tabs = $('#mode_tabs');
    tabs.tabs('option', 'active', 0);
    proceed_spacedock();
}

function tag_checkbox_row(name) {
    const chb = document.createElement('input');
    chb.setAttribute('type', 'checkbox');
    chb.setAttribute('name', 'tag');
    chb.setAttribute('value', name);
    const lbl = document.createElement('label');
    lbl.appendChild(chb);
    lbl.appendChild(document.createTextNode(name));
    const lblTh = document.createElement('th');
    lblTh.appendChild(lbl);
    const descrTd = document.createElement('td');
    descrTd.appendChild(document.createTextNode(tags_descriptions[name]));
    const tr = document.createElement('tr');
    tr.appendChild(lblTh);
    tr.appendChild(descrTd);
    return tr;
}

$(function () {
    var idcheck = function () {
        if (ckan_ids.includes(get_val("identifier"))) {
            $("#identifier_info").text("Identifier already in use");
        } else {
            $("#identifier_info").empty();
        }
    };
    $("#identifier").change(idcheck).blur(idcheck).on("input", idcheck);
    var namecheck = function () {
        if (ckan_names.includes(get_val("name"))) {
            $("#name_info").text("Name already in use");
        } else {
            $("#name_info").empty();
        }
    };
    $("#name").change(namecheck).blur(namecheck).on("input", namecheck);


    $("#accordion").accordion({
        collapsible: true,
        heightStyle: "content"
    });

    $("#generate_netkan").button().on("click", generate_netkan);
    $("#submit_to_index").button();

    $("#mode_tabs").tabs({
        activate: (evt, ui) => {
            switch (ui.newPanel.attr('id')) {
                case 'tab_spacedock':
                    proceed_spacedock();
                    break;
                case 'tab_github':
                    proceed_github();
                    break;
                case 'tab_http':
                    proceed_http();
                    break;
                case 'tab_kref':
                    proceed_kref();
                    break;
                case 'tab_edit':
                    proceed_edit();
                    break;
                case 'tab_other':
                    proceed_other();
                    break;
            }
        }
    });

    var al = $("#add_license").dialog({
        autoOpen: false,
        modal: true,
        height: 300,
        width: 400,
        buttons: {
            "Add": function () {
                var li = $("#license");
                var new_val = (li.val() + " " + get_val("add_license_id")).replace(/\s+/g, "\n").trim();
                li.val(new_val);
                $(this).dialog("close");
            },
            "Cancel": function () {
                $(this).dialog("close");
            }
        }
    });
    $("#add_license_id").autocomplete({
        "source": license_ids
    });
    $("#add_license_name").autocomplete({
        "source": license_names
    });
    $("#add_license_name").on("autocompleteclose", function () {
        $("#add_license_id").val(license_name_to_id[get_val("add_license_name")]);
    });
    $("#add_license_button").on("click", function () {
        al.dialog("open");
        $("#add_license input").val("");
    });

    $('#tags_mod_types').append(tags_mod_types.map(tag_checkbox_row));
    $('#tags_mod_descriptors').append(tags_mod_descriptors.map(tag_checkbox_row));

    add_ref("depends");
    add_ref("suggests");
    add_ref("provides");
    add_ref("conflicts");
    add_ref("recommends");
    add_ref("supports");

    install_template = $("#install li").detach();

    $("#install_add").button().on("click", function () {
        var install = install_template.clone();
        $("#install").append(install);
        function norm() {
            var t = $('[name="file"]', install);
            t.val(normalize_path(t.val()));
        }
        $('[name="file"]', install).on("change", norm);

        $('[name="remove"]', install).button().on("click", function () {
            install.remove();
            generate_netkan();
        });
        $("#install input").on('input', generate_netkan);
        $("#install select").selectmenu({ change: generate_netkan });
        generate_netkan();
    });
    $("#archive_upload").on("change", function (event) {
        function handleFile(f) {
            JSZip.loadAsync(f).then(function (zip) {
                var pa = [];
                var ap = $("#archive_paths").empty();
                zip.forEach(function (relativePath, file) {
                    pa.push([relativePath]);
                });
                pa.sort();
                for (var i = 0; i < pa.length; i++) {
                    ap.append($("<option/>").val(pa[i]));
                }
            });
        }
        var files = event.target.files;
        for (var i = 0, f; f = files[i]; i++) {
            handleFile(f);
        }
    });

    $("#reset_button").button().on('click', reset_fields);
    $("#accordion button").button();

    $("#tab_spacedock input, #tab_spacedock textarea").on('input', proceed_spacedock);
    $("#tab_github    input, #tab_github    textarea").on('input', proceed_github);
    $("#tab_http      input, #tab_http      textarea").on('input', proceed_http);
    $("#tab_kref      input, #tab_kref      textarea").on('input', proceed_kref);
    $("#tab_edit      input, #tab_edit      textarea").on('input', proceed_edit);
    $("#accordion     input, #accordion     textarea").on('input', generate_netkan);
    $("#accordion select").selectmenu({ change: generate_netkan });

    proceed_spacedock();
});
