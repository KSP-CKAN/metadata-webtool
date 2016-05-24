# Copyright (c) 2016, Jan Brohl <janbrohl@t-online.de>
# All rights reserved.

from urllib.request import urlopen
import json
import tarfile


def load_tar(f, name_filter):
    out = []
    with tarfile.open(fileobj=f, mode="r|gz") as tf:
        ti = tf.next()
        while ti is not None:
            if ti.isfile() and name_filter(ti.name):
                with tf.extractfile(ti) as tif:
                    s = tif.read().decode("utf-8-sig")
                out.append(json.loads(s))
            ti = tf.next()
    return out


def get_json(url):
    with urlopen(url) as f:
        s = f.read().decode("utf-8")
    return json.loads(s)


def get_json_in_tar(url, name_filter):
    with urlopen(url) as f:
        return load_tar(f, name_filter)
