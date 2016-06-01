#! /usr/bin/env python3

# not yet used

# Copyright (c) 2016, Jan Brohl <janbrohl@t-online.de>
# All rights reserved.


import cherrypy
import interfaces.ckan
import interfaces.netkan
import datetime
import os.path
from json import loads, dump, load
from ckan_util import split_version

if True:
    ckan = interfaces.ckan.full()
    netkan = interfaces.netkan.active_full()
    updated = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M")
    for e in ckan:
        e["x_webtool_id"] = e["identifier"] + "/" + e["version"]
    ckan.sort(key=(lambda e: (e["identifier"], split_version(e["version"]))))
    netkan.sort(key=(lambda e: e["identifier"]))
    with open("static/ckan.min.json", "w", encoding="utf8") as f:
        dump(ckan, f, sort_keys=True, separators=(',', ':'), ensure_ascii=False)
    with open("static/netkan.min.json", "w", encoding="utf8") as f:
        dump(netkan, f, sort_keys=True, separators=(
            ',', ':'), ensure_ascii=False)
else:
    with open("static/ckan.min.json", "r", encoding="utf8") as f:
        ckan = load(f)
    with open("static/netkan.min.json", "r", encoding="utf8") as f:
        netkan = load(f)
    updated = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M")


class Root:

    @cherrypy.expose
    @cherrypy.tools.json_out()
    def ckan(self, known=None):
        if known:
            where_eq = tuple(loads(known).items())
            return {"data": [e for e in ckan if all(v == e.get(k, None) for k, v in where_eq)], "updated": updated}
        return {"data": ckan, "updated": updated}

    @cherrypy.expose
    @cherrypy.tools.json_out()
    def netkan(self, known=None):
        if known:
            where_eq = tuple(loads(known).items())
            return {"data": [e for e in netkan if all(v == e.get(k, None) for k, v in where_eq)], "updated": updated}
        return {"data": netkan, "updated": updated}

    @cherrypy.expose
    def index(self):
        raise cherrypy.HTTPRedirect("static/index.html")

if __name__ == "__main__":
    conf = {"/": {"tools.gzip.on": True, "tools.gzip.mime_types": ["text/*", "application/json", "application/javascript"]},
            "/static": {"tools.staticdir.on": True, "tools.staticdir.dir": os.path.abspath("static")}
            }
    cherrypy.quickstart(Root(), config=conf)
