/*
* Copyright (c) 2016, Jan Brohl <janbrohl@t-online.de>
* All rights reserved.
*/
"use strict";

var mode;

function get_val(id) {
    return $("#" + id).val().trim();
}

function update_mode(new_mode) {
    mode = new_mode;
    for (var i in mandatory_fields) {
        var name = mandatory_fields[i];
        $("#" + name).attr("required", "required");
    }
    var ma = modes_autofill[mode];
    for (var i in ma) {
        var name = ma[i].replace(".", "_");
        $("#" + name).removeAttr("required");
    }
}
function proceed_spacedock() {
    update_mode("spacedock");
    $("#kref").val("#/ckan/spacedock/" + get_val("spacedock_id"));
}

function proceed_github() {
    update_mode("github");
    $("#kref").val("#/ckan/github/" + get_val("github_user") + "/" + get_val("github_repo"));
}

function proceed_http() {
    update_mode("http");
    $("#kref").val("#/ckan/http/" + get_val("http_url"));
}

function proceed_other() {
    update_mode("other");
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

function generate_netkan() {
    var o = {
        "spec_version": "v1.18" //until detection of needed version works
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

    var ressources = {};
    sets(ressources, "ressources_bugtracker", "bugtracker");
    sets(ressources, "ressources_license", "license");
    sets(ressources, "ressources_ci", "ci");
    sets(ressources, "ressources_spacedock", "spacedock");
    sets(ressources, "ressources_manual", "manual");
    sets(ressources, "ressources_homepage", "homepage");
    sets(ressources, "ressources_repository", "repository");
    sets(ressources, "ressources_x_screenshot", "x_screenshot")
    if (ressources.length) {
        o["ressources"] = ressources;
    }

    var install = {}
    sets(install, "file");
    sets(install, "install_to");
    if (install.length) {
        o["install"] = [install];
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
    if ($("#add_ksp_version_strict:checked").val()) {
        o["ksp_version_strict"] = true;
    }


    setrel(o, "depends");
    setrel(o, "recommends");
    setrel(o, "suggests");
    setrel(o, "supports");
    setrel(o, "conflicts");
    setrel(o, "provides");
    $("#json_output").val(JSON.stringify(o));



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


$(function () {



    $("#accordion").accordion({
        heightStyle: "content"
    });

    $("#add_vref").buttonset();
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
});