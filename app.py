#! /usr/bin/env python3

# not yet used

# Copyright (c) 2016, Jan Brohl <janbrohl@t-online.de>
# All rights reserved.


import cherrypy
import interfaces.ckan
import interfaces.netkan
import datetime
import os.path
from simpletal.simpleTALUtils import TemplateRoot, TemplateCache
from json import loads, dump, load
from ckan_util import split_version

tc = TemplateCache()
tr = TemplateRoot(os.path.abspath("templates"),
                  (lambda p: tc.getTemplate(p, "utf-8")))

if False:
    ckan = interfaces.ckan.full()
    netkan = interfaces.netkan.active_full()
    updated = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M")
    for e in ckan:
        e["x_sortable_version"] = split_version(e["version"])
    ckan.sort(key=(lambda e: (e["identifier"], e["x_sortable_version"])))
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


def filter_simple(entries, where_eq, latest):
    if where_eq:
        fe = [e for e in entries if all(
            v == e.get(k, None) for k, v in where_eq)]
    else:
        fe = entries
    if not latest:
        return fe
    lv = {}
    for e in fe:
        k = e["identifier"]
        if k not in lv or lv[k]["x_sortable_version"] <= e["x_sortable_version"]:
            lv[k] = e
    return sorted(lv.values(), key=(lambda e: e["identifier"]))


class Root:

    @cherrypy.expose
    def list(self, known=None, latest="0"):
        latest = loads(latest)
        if known:
            where_eq = tuple(loads(known).items())
        else:
            where_eq = None
        entries = filter_simple(ckan, where_eq, latest)
        return tr.expand("list", {"entries": entries})

    @cherrypy.expose
    @cherrypy.tools.json_out()
    def ckan(self, known=None, latest="0"):
        latest = loads(latest)
        if known:
            where_eq = tuple(loads(known).items())
        else:
            where_eq = None
        return {"data": filter_simple(ckan, where_eq, latest), "updated": updated}

    @cherrypy.expose
    @cherrypy.tools.json_out()
    def netkan(self, known=None, latest="0"):
        latest = loads(latest)
        if known:
            where_eq = tuple(loads(known).items())
        else:
            where_eq = None
        return {"data": filter_simple(netkan, where_eq, latest), "updated": updated}

    @cherrypy.expose
    def index(self):
        raise cherrypy.HTTPRedirect("static/index.html")

if __name__ == "__main__":
    conf = {"/": {"tools.gzip.on": True, "tools.gzip.mime_types": ["text/*", "application/json", "application/javascript"]},
            "/static": {"tools.staticdir.on": True, "tools.staticdir.dir": os.path.abspath("static")}
            }
    cherrypy.quickstart(Root(), config=conf)
