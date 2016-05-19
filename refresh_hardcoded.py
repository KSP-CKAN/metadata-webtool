import json
import ckan_interface

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


def main():
    ckan_ids = ckan_interface.ckan_ids()
    ckan_ids.sort()
    license_ids = ckan_interface.ckan_allowed_license_ids()
    license_ids.sort()
    with open("static/hardcoded.js", "w", encoding="utf-8") as f:
        f.write("// auto-generated - see refresh_hardcoded.py\n\n")

        f.write("var ckan_ids = ")
        json.dump(ckan_ids, f, indent="\t", sort_keys=True)
        f.write(";\n\n")

        f.write("var license_ids = ")
        json.dump(license_ids, f, indent="\t", sort_keys=True)
        f.write(";\n\n")

        f.write("var modes_autofill = ")
        json.dump(modes_autofill, f, indent="\t", sort_keys=True)
        f.write(";\n\n")

if __name__ == "__main__":
    main()
