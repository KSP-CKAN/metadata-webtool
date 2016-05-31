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
    var old_mode = mode;
    mode = new_mode;
    for (var i in mandatory_fields) {
        var name = mandatory_fields[i];
        $("#" + name).attr("required", "required");
    }
    var oma = modes_autofill[old_mode];
    for (var i in oma) {
        var name = oma[i].replace(".", "_");
        $("#" + name).removeClass("filled-by-netkan");
    }
    var ma = modes_autofill[mode];
    for (var i in ma) {
        var name = ma[i].replace(".", "_");
        $("#" + name).removeAttr("required").addClass("filled-by-netkan");
    }
    switch_add_vref();
}
function proceed_spacedock() {
    update_mode("spacedock");
    $("#kref").val("#/ckan/spacedock/" + get_val("spacedock_id"));
}

function proceed_github() {
    update_mode("github");
    var k = "#/ckan/github/" + get_val("github_user") + "/" + get_val("github_repo");
    var fr = get_val("github_filter_regexp");
    if (fr && fr.length) {
        k = k + "/asset_match/" + fr;
    }
    $("#kref").val(k);
}

function proceed_http() {
    update_mode("http");
    $("#kref").val("#/ckan/http/" + get_val("http_url"));
}

function proceed_kref() {
    var sd = "#/ckan/spacedock/";
    var gh = "#/ckan/github/";
    var h = "#/ckan/http/";

    var k = get_val("kref_kref");
    if (k.indexOf(sd) == 0) {
        $("#spacedock_id").val(k.substring(sd.length).replace("/", ""));
        return proceed_spacedock();
    } else if (k.indexOf(gh) == 0) {
        var ghs = k.substring(gh.length).split("/", 4);
        $("#github_user").val(ghs[0]);
        $("#github_repo").val(ghs[1]);
        $("#github_filter_regexp").val(ghs[3]);
        return proceed_spacedock();

    } else if (k.indexOf(h) == 0) {
        $("#http_url").val(k.substring(h.length));
        return proceed_http();
    }
}
function proceed_edit() {
    var o = JSON.parse(get_val("edit_json"));
    var ref_fields = ["depends", "recommends", "suggests", "supports", "conflicts", "provides"];
    var not_mapped = ["resources", "install",
        "depends", "recommends", "suggests", "supports", "conflicts", "provides",
        "ksp_version_strict", "ksp_version", "ksp_version_min", "ksp_version_max",
        "$vref"
    ];
    for (var key in o) {
        if (!not_mapped.includes("key")) {
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
    if (o["ksp_version_strict"]) {
        $("#add_ksp_version_strict").attr("checked", "checked");
    } else {
        $("#add_ksp_version_strict").removeAttr("checked");
    }

    $("#kref_kref").val(o["$kref"]);
    proceed_kref();
}

function proceed_other() {
    update_mode("other");
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
    var o = {
        "spec_version": "v1.16" //until detection of needed version works
    };

    sets(o, "name");
    sets(o, "identifier");
    sets(o, "abstract");
    seta(o, "license");
    seta(o, "author");
    sets(o, "download");
    sets(o, "kref", "$kref");
    if ($("#add_vref:checked").val()) {
        o["$vref"] = "#/ckan/ksp-avc";
    }

    var resources = {};
    sets(resources, "resources_bugtracker", "bugtracker");
    sets(resources, "resources_license", "license");
    sets(resources, "resources_ci", "ci");
    sets(resources, "resources_spacedock", "spacedock");
    sets(resources, "resources_manual", "manual");
    sets(resources, "resources_homepage", "homepage");
    sets(resources, "resources_repository", "repository");
    sets(resources, "resources_x_screenshot", "x_screenshot")
    if (resources.length) {
        o["resources"] = resources;
    }

    var install = []
    $("#install li").each(function () {
        var file = $('[name="file"]', this).val();
        var d = { "file": normalize_path(file), "install_to": $('[name="install_to"]', this).val() };
        /* Deactivate until release of Spec v1.18
        var install_as = $('[name="install_as"]', this).val();
        if (install_as && install_as.length) {
            d["as"] = install_as;
        }
        */
        install.push(d);
    });
    o["install"] = install;

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
    if ($("#add_ksp_version_strict:checked").val()) {
        o["ksp_version_strict"] = true;
    }


    setrel(o, "depends");
    setrel(o, "recommends");
    setrel(o, "suggests");
    setrel(o, "supports");
    setrel(o, "conflicts");
    setrel(o, "provides");

    var uj = get_val("update_json");
    var ujo;
    try {
        ujo = JSON.parse(uj);
    } catch (err) {
        alert("Update JSON field not applied\n\n" + err);
    }
    if (ujo) {
        for (var key in ujo) {
            o[key] = ujo[key];
        }
    }

    var dummies = {};
    var autofill = modes_autofill[mode];
    for (var i in mandatory_fields) {
        var k = mandatory_fields[i];
        if (autofill.includes(k)) {
            dummies[k] = "any";
        }
    }
    if (o["$vref"]) {
        dummies["version"] = "any";
    }
    if (dummies.download) {
        dummies.download = "http://example.com";
    }
    if (dummies.license) {
        dummies.license = "restricted";
    }
    var dummy_filled = {};
    for (var k in dummies) {
        dummy_filled[k] = dummies[k];
    }
    for (var k in o) {
        dummy_filled[k] = o[k];
    }


    var validation_result = tv4.validateMultiple(dummy_filled, ckan_schema);
    if (!validation_result.valid) {
        var e = validation_result.errors;
        var msg = "There were errors validating against CKAN-Schema with dummy values for fields normally filled by NetKAN:";
        for (var i = 0; i < e.length; i++) {
            msg = msg + "\n" + e[i].message;
        }
        alert(msg);
    }
    $("#json_output").val(JSON.stringify(o, null, "\t"));



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
        heightStyle: "content"
    });

    $("#add_ksp_version_strict").buttonset();

    $("#generate_netkan").button().on("click", generate_netkan);

    $("#mode_tabs").tabs();
    update_mode("other");

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

    add_ref("depends");
    add_ref("suggests");
    add_ref("provides");
    add_ref("conflicts");
    add_ref("recommends");
    add_ref("supports");

    install_template = $("#install li").detach();

    $("#install_add").on("click", function () {
        var install = install_template.clone();
        $("#install").append(install);
        function norm() {
            var t = $('[name="file"]', install);
            t.val(normalize_path(t.val()));
        }
        $('[name="file"]', install).on("change", norm);

        $('[name="remove"]', install).on("click", function () {
            install.remove();
        });

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

});