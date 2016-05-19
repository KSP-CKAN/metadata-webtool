# Copyright (c) 2016, Jan Brohl <janbrohl@t-online.de>
# All rights reserved.

from urllib.request import urlopen
import json
import tarfile
import re


def get_json(url):
    with urlopen(url) as f:
        s = f.read().decode("utf-8")
    return json.loads(s)


def load_tar(f, ext):
    out = []
    with tarfile.open(fileobj=f, mode="r|gz") as tf:
        ti = tf.next()
        while ti is not None:
            if ti.isfile() and ti.name.endswith(ext):
                with tf.extractfile(ti) as tif:
                    s = tif.read().decode("utf-8-sig")
                out.append(json.loads(s))
            ti = tf.next()
    return out


def get_full(url, ext):
    with urlopen(url) as f:
        return load_tar(f, ext)

CKAN_EXT = ".ckan"
NETKAN_EXT = ".netkan"


def ckan_full():
    return get_full("https://github.com/KSP-CKAN/CKAN-meta/archive/master.tar.gz", CKAN_EXT)


def netkan_full():
    return get_full("https://github.com/KSP-CKAN/NetKAN/archive/master.tar.gz", NETKAN_EXT)


def ckan_ids():  # depends on repo layout
    ckan_dirs = get_json(
        "https://api.github.com/repos/KSP-CKAN/CKAN-meta/contents")
    return [e["name"] for e in ckan_dirs]


def netkan_ids():  # depends on repo layout
    netkan_files = get_json(
        "https://api.github.com/repos/KSP-CKAN/NetKAN/contents/NetKAN")
    netkan_ext_len = len(NETKAN_EXT)
    return [n[:-netkan_ext_len] for n in (e["name"] for e in netkan_files) if n.endswith(NETKAN_EXT)]


def ckan_last_modified():
    repo_info = get_json("https://api.github.com/repos/KSP-CKAN/NetKAN")
    return max(repo_info["updated_at"], repo_info["pushed_at"])


def ckan_last_modified():
    repo_info = get_json("https://api.github.com/repos/KSP-CKAN/CKAN-meta")
    return max(repo_info["updated_at"], repo_info["pushed_at"])


def ckan_json_schema():
    schema = get_json(
        "https://raw.githubusercontent.com/KSP-CKAN/CKAN/master/CKAN.schema")
    return schema


def ckan_allowed_license_ids():  # depends on repo layout and file format - risky?
    schema = ckan_json_schema()
    li = schema["definitions"]["license"]
    return li["enum"]
