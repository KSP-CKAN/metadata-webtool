# Metadata-Webtool


## Current Status

You can try it and the generated data *should* be good for submitting but the user interface is not great yet.


## Original Mission

What's currently specified is just a base to create brand new netkans for not-yet-hosted mods. Eventually expanding the UI to allow editing existing metadata would be great, but is likely much more in-depth.

Primarily this is a web form which results in a JSON file that is sent in a PR to KSP-CKAN/NetKAN. Workflow is pretty heavily reliant on where a mod is hosted. Most fields are also optional.
Spacedock, github, and all other hosts (curse will be a kref-able source in the near future) are the current workflow determinants.


## Can I try it?

Yes, you can try it at https://ksp-ckan.github.io/metadata-webtool/


## Can I also run the current version at my Computer?

Yes, just open static/index.html

The Python stuff (*.py) is not yet needed for trying it out but for updating data only - just run refresh_datajs.py if you want to do that.
