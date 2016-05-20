#! /usr/bin/env python3

# Copyright (c) 2016, Jan Brohl <janbrohl@t-online.de>
# All rights reserved.

import json
import ckan_interface
import datetime

mandatory_fields = [
    "abstract",
    "download",
    "identifier",
    "license",
    "name",
    "spec_version",
    "version"
]

modes_autofill = {
    "github": [
        "author",
        "download",
        "download_hash",
        "download_size",
        "resources.repository",
        "version"
    ],
    "http": [
        "download",
        "download_content_type",
        "download_hash",
        "download_size"
    ],
    "other": [],
    "spacedock": [
        "abstract",
        "author",
        "download",
        "download_hash",
        "download_size",
        "ksp_version",
        "license",
        "name",
        "resources.homepage",
        "resources.repository",
        "resources.spacedock",
        "resources.x_screenshot",
        "version"
    ]
}

js = """
var ckan_ids = [];
var ckan_names = [];
var ckan_name_to_id = {};

for (var i in ckan_names_ids) {
    var id = ckan_names_ids[i][1];
    var name = ckan_names_ids[i][0];
    if (!ckan_ids.includes(id)) {
        ckan_ids.push(id);
    }
    if (!ckan_names.includes(name)) {
        ckan_names.push(name);
    }
    ckan_name_to_id[name] = id;
}
ckan_ids.sort();
ckan_names.sort();
"""


def main():
    ckan = ckan_interface.ckan_full()
    ckan_ids = sorted(set(e["identifier"] for e in ckan))
    ckan_names_ids = sorted(
        set((e["name"].strip(), e["identifier"]) for e in ckan))
    license_ids = ckan_interface.ckan_allowed_license_ids()
    license_ids.sort()
    ckan_schema = ckan_interface.ckan_json_schema()
    now = datetime.datetime.utcnow()
    with open("static/hardcoded.js", "w", encoding="utf-8") as f:
        f.write("// auto-generated on " + now.strftime("%Y-%m-%dT%H:%M:%S") +
                " UTC - see refresh_hardcoded.py\n\"use strict\";\n\n")

        f.write("var mandatory_fields = ")
        json.dump(mandatory_fields, f, sort_keys=True)
        f.write(";\n\n")

        f.write("var license_ids = ")
        json.dump(license_ids, f, sort_keys=True)
        f.write(";\n\n")

        f.write("var modes_autofill = ")
        json.dump(modes_autofill, f, sort_keys=True)
        f.write(";\n\n")

        f.write("var ckan_schema = ")
        json.dump(ckan_schema, f, sort_keys=True)
        f.write(";\n\n")

        f.write("var ckan_names_ids = ")
        json.dump(ckan_names_ids, f, sort_keys=True)
        f.write(";\n\n")

        f.write(js)


if __name__ == "__main__":
    main()
