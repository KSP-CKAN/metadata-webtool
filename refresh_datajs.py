#! /usr/bin/env python3

# Copyright (c) 2016, Jan Brohl <janbrohl@t-online.de>
# All rights reserved.

import json
import interfaces.ckan
import datetime

license_id_to_name = {
    "Apache": "Apache License",
    "Apache-1.0": "Apache License 1.0",
    "Apache-2.0": "Apache License 2.0",
    "Artistic": "Artistic License",
    "Artistic-1.0": "Artistic License 1.0",
    "Artistic-2.0": "Artistic License 2.0",
    "BSD-2-clause": "BSD 2-clause \"Simplified\" License",
    "BSD-3-clause": "BSD 3-clause \"New\" or \"Revised\" License",
    "BSD-4-clause": "BSD 4-clause \"Original\" or \"Old\" License",
    "CC-BY": "Creative Commons Attribution",
    "CC-BY-1.0": "Creative Commons Attribution 1.0",
    "CC-BY-2.0": "Creative Commons Attribution 2.0",
    "CC-BY-2.5": "Creative Commons Attribution 2.5",
    "CC-BY-3.0": "Creative Commons Attribution 3.0",
    "CC-BY-4.0": "Creative Commons Attribution 4.0",
    "CC-BY-NC": "Creative Commons Attribution Non Commercial",
    "CC-BY-NC-1.0": "Creative Commons Attribution Non Commercial 1.0",
    "CC-BY-NC-2.0": "Creative Commons Attribution Non Commercial 2.0",
    "CC-BY-NC-2.5": "Creative Commons Attribution Non Commercial 2.5",
    "CC-BY-NC-3.0": "Creative Commons Attribution Non Commercial 3.0",
    "CC-BY-NC-4.0": "Creative Commons Attribution Non Commercial 4.0",
    "CC-BY-NC-ND": "Creative Commons Attribution Non Commercial No Derivatives",
    "CC-BY-NC-ND-1.0": "Creative Commons Attribution Non Commercial No Derivatives 1.0",
    "CC-BY-NC-ND-2.0": "Creative Commons Attribution Non Commercial No Derivatives 2.0",
    "CC-BY-NC-ND-2.5": "Creative Commons Attribution Non Commercial No Derivatives 2.5",
    "CC-BY-NC-ND-3.0": "Creative Commons Attribution Non Commercial No Derivatives 3.0",
    "CC-BY-NC-ND-4.0": "Creative Commons Attribution Non Commercial No Derivatives 4.0",
    "CC-BY-NC-SA": "Creative Commons Attribution Non Commercial Share Alike",
    "CC-BY-NC-SA-1.0": "Creative Commons Attribution Non Commercial Share Alike 1.0",
    "CC-BY-NC-SA-2.0": "Creative Commons Attribution Non Commercial Share Alike 2.0",
    "CC-BY-NC-SA-2.5": "Creative Commons Attribution Non Commercial Share Alike 2.5",
    "CC-BY-NC-SA-3.0": "Creative Commons Attribution Non Commercial Share Alike 3.0",
    "CC-BY-NC-SA-4.0": "Creative Commons Attribution Non Commercial Share Alike 4.0",
    "CC-BY-SA": "Creative Commons Attribution Share Alike",
    "CC-BY-SA-1.0": "Creative Commons Attribution Share Alike 1.0",
    "CC-BY-SA-2.0": "Creative Commons Attribution Share Alike 2.0",
    "CC-BY-SA-2.5": "Creative Commons Attribution Share Alike 2.5",
    "CC-BY-SA-3.0": "Creative Commons Attribution Share Alike 3.0",
    "CC-BY-SA-4.0": "Creative Commons Attribution Share Alike 4.0",
    "CC0": "Creative Commons Zero v1.0 Universal",
    "CDDL": "Common Development and Distribution License",
    "CPL": "Common Public License",
    "EFL-1.0": "Eiffel Forum License v1.0",
    "EFL-2.0": "Eiffel Forum License v2.0",
    "Expat": "MIT License (Expat)",
    "GFDL-1.0": "GNU Free Documentation License v1.0",
    "GFDL-1.1": "GNU Free Documentation License v1.1",
    "GFDL-1.2": "GNU Free Documentation License v1.2",
    "GFDL-1.3": "GNU Free Documentation License v1.3",
    "GFDL-NIV-1.0": "GNU Free Documentation License, with no Front-Cover or Back-Cover Texts or Invariant Sections v1.0",
    "GFDL-NIV-1.1": "GNU Free Documentation License, with no Front-Cover or Back-Cover Texts or Invariant Sections v1.1",
    "GFDL-NIV-1.2": "GNU Free Documentation License, with no Front-Cover or Back-Cover Texts or Invariant Sections v1.2",
    "GFDL-NIV-1.3": "GNU Free Documentation License, with no Front-Cover or Back-Cover Texts or Invariant Sections v1.3",
    "GPL-1.0": "GNU General Public License v1.0 only",
    "GPL-2.0": "GNU General Public License v2.0 only",
    "GPL-3.0": "GNU General Public License v3.0 only",
    "ISC": "ISC License",
    "LGPL-2.0": "GNU Library General Public License v2 only",
    "LGPL-2.1": "GNU Library General Public License v2.1 only",
    "LGPL-3.0": "GNU Library General Public License v3 only",
    "LPPL-1.0": "LaTeX Project Public License v1.0",
    "LPPL-1.1": "LaTeX Project Public License v1.1",
    "LPPL-1.2": "LaTeX Project Public License v1.2",
    "LPPL-1.3c": "LaTeX Project Public License v1.3c",
    "MIT": "MIT License (Expat)",
    "MPL-1.1": "Mozilla Public License 1.1",
    "Perl": "Artistic License 1.0 (Perl)",
    "Python-2.0": "Python License 2.0",
    "QPL-1.0": "Q Public License 1.0",
    "Unlicense": "The Unlicense",
    "W3C": "W3C Software Notice and License (2002-12-31)",
    "WTFPL": "Do What The F*ck You Want To Public License",
    "Zlib": "zlib License",
    "Zope": "Zope Public License",
    "open-source": "Other Open Source Initiative (OSI) approved license",
    "public-domain": "public domain",
    "restricted": "All rights reserved",
    "unknown": "License not provided",
    "unrestricted": "Not an OSI approved license, but not restricted"
}

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
var license_name_to_id = {};
for (var k in license_id_to_name) {
    license_name_to_id[license_id_to_name[k]] = k;
}

var license_ids = Object.keys(license_id_to_name);
license_ids.sort();
var license_names = Object.keys(license_name_to_id);
license_names.sort();


var ckan_ids = [];
var ckan_name_to_id = {};

for (var i in ckan_names_ids) {
    var id = ckan_names_ids[i][1];
    var name = ckan_names_ids[i][0];
    if (!ckan_ids.includes(id)) {
        ckan_ids.push(id);
    }
    ckan_name_to_id[name] = id;
}
ckan_ids.sort();

var ckan_names = Object.keys(ckan_name_to_id);
ckan_names.sort();
"""


def main():
    ckan = interfaces.ckan.full()
    ckan_ids = sorted(set(e["identifier"] for e in ckan))
    ckan_names_ids = sorted(
        set((e["name"].strip(), e["identifier"]) for e in ckan))
    ckan_schema = interfaces.ckan.json_schema()
    now = datetime.datetime.utcnow()
    now_str = now.strftime("%Y-%m-%dT%H:%M:%S")
    with open("static/data.js", "w", encoding="utf-8") as f:
        f.write("// auto-generated on %s UTC - see refresh_datajs.py\n\"use strict\";\n\nvar data_updated = \"%s\";\n\n" % (now_str, now_str))

        f.write("var mandatory_fields = ")
        json.dump(mandatory_fields, f, sort_keys=True)
        f.write(";\n\n")

        f.write("var license_id_to_name = ")
        json.dump(license_id_to_name, f, sort_keys=True)
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
