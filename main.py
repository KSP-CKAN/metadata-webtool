# not yet used

# Copyright (c) 2016, Jan Brohl <janbrohl@t-online.de>
# All rights reserved.


import bottle
import ckan_interface

app = bottle.Bottle()


@app.get("/ckan_ids")
def ckan_ids():
    return {"ids": ckan_interface.ids()}


@app.get("/check_spacedock")
def check_spacedock():  # incomplete
    data = bottle.request.json
    sdid = data["spacedock_id"]


@app.get("/check_github")
def check_github():  # incomplete
    data = bottle.request.json
    user = data["github_user"]
    repo = data["github_repo"]
    asset_match = data["github_asset_match"]


@app.get("/check_http")
def check_http():  # incomplete
    data = bottle.request.json
    url = data["http_url"]


@app.get("/")
@app.get("/<path:path>")
def static(path="index.html"):
    return bottle.static_file(path, "static")

if __name__ == "__main__":
    app.run()
