# Copyright (c) 2016, Jan Brohl <janbrohl@t-online.de>
# All rights reserved.

from urllib.request import urlopen
import json


def get_json(url):
    with urlopen(url) as f:
        s = f.read().decode("utf-8")
    return json.loads(s)


def ksp_versions():
    return [e["friendly_version"] for e in get_json("https://spacedock.info/api/kspversions")]


def mod_info(mod_id):
    return get_json("https://spacedock.info/api/mod/%i" % mod_id)
