# Copyright (c) 2016, Jan Brohl <janbrohl@t-online.de>
# All rights reserved.


from interfaces.github import contents, repo, json_in_repo, json_in_file

CKAN_EXT = ".ckan"


def full():
    return json_in_repo("KSP-CKAN", "CKAN-meta", "master", (lambda n: n.endswith(CKAN_EXT)))


def ids():  # depends on repo layout
    ckan_dirs = contents("KSP-CKAN", "CKAN-meta")
    return [e["name"] for e in ckan_dirs]


def last_modified():
    repo_info = repo("KSP-CKAN", "CKAN-meta")
    return max(repo_info["updated_at"], repo_info["pushed_at"])


def json_schema():  # depends on repo layout
    schema = json_in_file("KSP-CKAN", "CKAN", "CKAN.schema")
    return schema


def allowed_license_ids():  # depends on repo layout and file format - risky?
    schema = json_schema()
    li = schema["definitions"]["license"]
    return li["enum"]
