#! /usr/bin/env python3

# not yet used

# Copyright (c) 2016, Jan Brohl <janbrohl@t-online.de>
# All rights reserved.


import bottle
import interfaces.ckan
import interfaces.netkan
import datetime
from json import loads
from ckan_util import split_version

ckan = interfaces.ckan.full()
netkan = interfaces.netkan.active_full()
updated = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M")
ckan.sort(key=(lambda e: (e["identifier"], split_version(e["version"]))))
netkan.sort(key=(lambda e: e["identifier"]))


app = bottle.Bottle()


@app.get("/ckan/")
def ckan_json():
    known_raw = bottle.request.query.known
    if known_raw:
        where_eq = tuple(loads(known_raw).items())
        return {"data": [e for e in ckan if all(v == e.get(k, None) for k, v in where_eq)], "updated": updated}
    return {"data": ckan, "updated": updated}


@app.get("/netkan/")
def netkan_json():
    known_raw = bottle.request.query.known
    if known_raw:
        where_eq = tuple(loads(known_raw).items())
        return {"data": [e for e in netkan if all(v == e.get(k, None) for k, v in where_eq)], "updated": updated}
    return {"data": netkan, "updated": updated}


@app.get("/")
@app.get("/<path:path>")
def static(path="index.html"):
    return bottle.static_file(path, "static")

if __name__ == "__main__":
    app.run()
