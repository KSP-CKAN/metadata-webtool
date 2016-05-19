import json
import ckan_interface


def main():
    ckan_ids = ckan_interface.ckan_ids()
    ckan_ids.sort()
    license_ids = ckan_interface.ckan_allowed_license_ids()
    license_ids.sort()
    with open("static/hardcoded.js", "w", encoding="utf-8") as f:
        f.write("// auto-generated - see refresh_hardcoded.py\n\n")

        f.write("var ckan_ids = ")
        json.dump(ckan_ids, f, indent="\t")
        f.write(";\n\n")

        f.write("var license_ids = ")
        json.dump(license_ids, f, indent="\t")
        f.write(";\n\n")

if __name__ == "__main__":
    main()
