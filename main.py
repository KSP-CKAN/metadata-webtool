# not yet used

import bottle

app = bottle.Bottle()


@app.get("/check_spacedock")
def check_spacedock():
    data = bottle.request.json
    sdid = data["spacedock_id"]


@app.get("/check_github")
def check_github():
    data = bottle.request.json
    user = data["github_user"]
    repo = data["github_repo"]
    asset_match = data["github_asset_match"]


@app.get("/check_http")
def check_http():
    data = bottle.request.json
    url = data["http_url"]


@app.get("/")
@app.get("/<path:path>")
def static(path="index.html"):
    return bottle.static_file(path, "static")

if __name__ == "__main__":
    app.run()
