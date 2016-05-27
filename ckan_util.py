# Copyright (c) 2016, Jan Brohl <janbrohl@t-online.de>
# All rights reserved.

import re
import string

version_ordering = string.ascii_letters + "+-._"
epoch_re = re.compile("([0-9]*):")
ver_parts_re = re.compile("([^0-9]+)|([0-9]+)")


def split_version(vs):
    vo = version_ordering
    m = epoch_re.match(vs)
    if m:
        epoch = int(m.group(1) or "0", 10)
        start = m.end()
    else:
        epoch = 0
        start = 0
    parts = [epoch]
    for s, i in ver_parts_re.findall(vs, start):
        if i:
            iv = int(i, 10)
        else:
            iv = 0
        # all the letters sort earlier than all the non-letters
        parts.append(tuple(vo.index(c) for c in s))
        parts.append(iv)
    return tuple(parts)
