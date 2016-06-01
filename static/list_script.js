/*
* Copyright (c) 2016, Jan Brohl <janbrohl@t-online.de>
* All rights reserved.
*/
"use strict";

var ckan;



$(document).ready(function () {
    $.getJSON("ckan.min.json", function (data) {
        ckan = data;

        var td = $("<td/>");
        var tr = $("<tr/>");
        var tb = $("#mods tbody");
        for (var i = 0; i < ckan.length; i++) {
            var e = ckan[i];
            var name = td.clone().text(e.name);
            var ident = td.clone().text(e.identifier);
            var version = td.clone().text(e.version);
            var row = tr.clone().append(name).append(ident).append(version);
            tb.append(row);

        }
    });
    sorttable.makeSortable(document.getElementById("mods"));
});