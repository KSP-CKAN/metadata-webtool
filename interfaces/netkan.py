# Copyright (c) 2016, Jan Brohl <janbrohl@t-online.de>
# All rights reserved.

from interfaces.github import contents, json_in_repo, repo

NETKAN_ACTIVE_EXT = ".netkan"
NETKAN_FROZEN_EXT = ".frozen"


def last_modified():
    repo_info = repo("KSP-CKAN", "NetKAN")
    return max(repo_info["updated_at"], repo_info["pushed_at"])


def active_full():
    return json_in_repo("KSP-CKAN", "NetKAN", "master", (lambda n: n.endswith(NETKAN_ACTIVE_EXT)))


def active_ids():  # depends on repo layout
    netkan_files = contents("KSP-CKAN", "NetKAN", "NetKAN")
    netkan_ext_len = len(NETKAN_ACTIVE_EXT)
    return [n[:-netkan_ext_len] for n in (e["name"] for e in netkan_files) if n.endswith(NETKAN_ACTIVE_EXT)]


def frozen_ids():  # depends on repo layout
    netkan_files = contents("KSP-CKAN", "NetKAN", "NetKAN")
    netkan_ext_len = len(NETKAN_FROZEN_EXT)
    return [n[:-netkan_ext_len] for n in (e["name"] for e in netkan_files) if n.endswith(NETKAN_FROZEN_EXT)]
