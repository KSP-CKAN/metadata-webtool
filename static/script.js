/*
* Copyright (c) 2016, Jan Brohl <janbrohl@t-online.de>
* All rights reserved.
*/

var mode;


function update_mode(new_mode) {
    mode = new_mode;
}
function generate_netkan() {
    var o = {
        "spec_version": "v1.18" //until detection of needed version works
    };
    function sets(obj, name, as_name) {
        var v = $("#" + name).val().trim();
        if (v && v.length) {
            if (as_name) {
                obj[as_name] = v;
            } else {
                obj[name] = v;
            }
        }
    }
    function seta(obj, name, as_name) {
        var v = $("#" + name).val().trim();
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
        var v = $("#" + name).val().trim();
        if (v && v.length) {
            var va = v.split("\n");
            var entries = [];
            for (var i in va) {
                var line = va[i];
                var found = line.search(/[<>=]=/);
                var entry = {};
                if (found != -1) {
                    entry["name"] = line.substring(0, found).trim();
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
                } else {
                    entry["name"] = line.trim();
                }
                entries.push(entry)
            }
            if (as_name) {
                obj[as_name] = entries;
            } else {
                obj[name] = entries;
            }
        }
    }
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
                var new_val = (li.val() + " " + $("#add_" + name + "_id").val()).replace(/\s+/g, "\n").trim();
                li.val(new_val);
                $(this).dialog("close");
            },
            "Cancel": function () {
                $(this).dialog("close");
            }
        }
    });
    $("#add_" + name + "_id").autocomplete({
        "source": ckan_ids
    });
    $("#add_" + name + "_button").on("click", function () {
        ar.dialog("open");
        $("#add_" + name + " input").val("");
    });
}


$(function () {
    $("#generate_netkan").button().on("click", generate_netkan);
    $("#mode_tabs").tabs();
    update_mode("spacedock");

    var al = $("#add_license").dialog({
        autoOpen: false,
        modal: true,
        height: 300,
        width: 400,
        buttons: {
            "Add": function () {
                var li = $("#license");
                var new_val = (li.val() + " " + $("#add_license_id").val()).replace(/\s+/g, "\n").trim();
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