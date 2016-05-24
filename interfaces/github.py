# Copyright (c) 2016, Jan Brohl <janbrohl@t-online.de>
# All rights reserved.

from interfaces._util import get_json, get_json_in_tar


def contents(user, repo, path=""):
    return get_json("https://api.github.com/repos/%s/%s/contents/%s" % (user, repo, path))


def repo(user, repo):
    return get_json("https://api.github.com/repos/%s/%s" % (user, repo))


def json_in_file(user, repo, path, branch="master"):
    return get_json("https://raw.githubusercontent.com/%s/%s/%s/%s" % (user, repo, branch, path))


def json_in_repo(user, repo, branch="master", name_filter=(lambda n: next.endswith(".json"))):
    return get_json_in_tar("https://github.com/%s/%s/archive/%s.tar.gz" % (user, repo, branch), name_filter)
