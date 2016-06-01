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
from json import dumps, loads, dump, load
from ckan_util import split_version, normalize

tc = TemplateCache()
tr = TemplateRoot(os.path.abspath("templates"),
                  (lambda p: tc.getTemplate(p, "utf-8")))


def friendly_timestamp(ts):
    return ts.strftime("%Y-%m-%dT%H:%M")


def update_ckan():  # TODO: make thread-safe
    ckan_updated = datetime.datetime.utcnow()
    ckan = interfaces.ckan.full()
    for e in ckan:
        normalize(e)
        e["x_sortable_version"] = split_version(e["version"])
    ckan.sort(key=(lambda e: (e["identifier"], e["x_sortable_version"])))
    with open("static/ckan.min.json", "w", encoding="utf8") as f:
        dump(ckan, f, sort_keys=True, separators=(',', ':'), ensure_ascii=False)


def update_netkan():  # TODO: make thread-safe
    netkan_updated = datetime.datetime.utcnow()
    netkan = interfaces.netkan.active_full()
    netkan.sort(key=(lambda e: e["identifier"]))
    with open("static/netkan.min.json", "w", encoding="utf8") as f:
        dump(netkan, f, sort_keys=True, separators=(
            ',', ':'), ensure_ascii=False)


ckan_updated = datetime.datetime.utcnow()  # TODO: stop lying ;)
with open("static/ckan.min.json", "r", encoding="utf8") as f:
    ckan = load(f)
netkan_updated = datetime.datetime.utcnow()  # TODO: stop lying ;)
with open("static/netkan.min.json", "r", encoding="utf8") as f:
    netkan = load(f)


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
    def notify_ckan_meta(self):  # TODO: make sure it's from github
        update_ckan()

    @cherrypy.expose
    def notify_netkan(self):  # TODO: make sure it's from github
        update_netkan()

    @cherrypy.expose
    def ckan(self, known=None, latest="0", view="html"):
        cherrypy.response.headers[
            "Last-Modified"] = cherrypy.lib.httputil.HTTPDate(ckan_updated.timestamp())
        cherrypy.lib.cptools.validate_since()
        latest = loads(latest)
        if known:
            where_eq = tuple(loads(known).items())
        else:
            where_eq = None
        entries = filter_simple(ckan, where_eq, latest)
        options = {"entries": entries,
                   "updated": friendly_timestamp(ckan_updated)}
        if view == "json":
            cherrypy.response.headers['Content-Type'] = "application/json"
            if entries is ckan:
                return open("static/ckan.min.json", "rb")
            return dumps(options, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode("utf-8")
        return tr.expand("list", options)

    @cherrypy.expose
    def netkan(self, known=None, latest="0", view="html"):
        cherrypy.response.headers[
            "Last-Modified"] = cherrypy.lib.httputil.HTTPDate(netkan_updated.timestamp())
        cherrypy.lib.cptools.validate_since()
        latest = loads(latest)
        if known:
            where_eq = tuple(loads(known).items())
        else:
            where_eq = None
        entries = filter_simple(netkan, where_eq, latest)
        options = {"entries": entries,
                   "updated": friendly_timestamp(netkan_updated)}
        if view == "json":
            cherrypy.response.headers['Content-Type'] = "application/json"
            if entries is netkan:
                return open("static/netkan.min.json", "rb")
            return dumps(options, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode("utf-8")
        return tr.expand("list", options)

    @cherrypy.expose
    def index(self):
        raise cherrypy.HTTPRedirect("static/index.html")

if __name__ == "__main__":
    conf = {"/": {"tools.gzip.on": True, "tools.gzip.mime_types": ["text/*", "application/json", "application/javascript"]},
            "/static": {"tools.staticdir.on": True, "tools.staticdir.dir": os.path.abspath("static")}
            }
    cherrypy.quickstart(Root(), config=conf)
