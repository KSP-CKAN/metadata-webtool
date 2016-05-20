CKAN-Metadata-Generator
#######################

Current Status
==============

Not actually bug-free to be positive. ;)

Neither actually well documented.


Original Mission
================

What's currently specified is just a base to create brand new netkans for not-yet-hosted mods. Eventually expanding the UI to allow editing existing metadata would be great, but is likely much more in-depth.

Primarily this is a web form which results in a JSON file that is sent in a PR to KSP-CKAN/NetKAN. Workflow is pretty heavily reliant on where a mod is hosted. Most fields are also optional.
Spacedock, github, and all other hosts (curse will be a kref-able source in the near future) are the current workflow determinants.


How to make it work
===================

Currently the Python stuff (*.py) is not yet needed for trying it out.

"Just" install jquery, jqueri-ui, tv4 via bower (bower.json and .bowerrc already configured) and then open static/index.html