CKAN-Metadata-Generator
#######################

Current Status
==============

Not actually usable.


Original Mission
================

What's currently specified is just a base to create brand new netkans for not-yet-hosted mods. Eventually expanding the UI to allow editing existing metadata would be great, but is likely much more in-depth.

Primarily this is a web form which results in a JSON file that is sent in a PR to KSP-CKAN/NetKAN. Workflow is pretty heavily reliant on where a mod is hosted. Most fields are also optional.
Spacedock, github, and all other hosts (curse will be a kref-able source in the near future) are the current workflow determinants.

SPACEDOCK
---------

If a user selects spacedock we should start by asking for the mod ID and then populating what info we can by scraping the API before accepting user input

API sample: http://spacedock.info/api/mod/580

For spacedock, netkan scrapes the name, abstract (short_description), author/shared_authors, version, ksp_version, download, resources.homepage (website), resources.repository (source_code)

::

	{
		"$kref"          : determined entirely by the spacedock mod ID given by the user
		"$vref"          : can probably just be a checkbox for users "Does this mod contain a .version file"
		"spec_version"   : this shouldn't be set by users, we should set the spec_version based on what functions are used
		"name"           : we could scrape spacedock for the `name` it provides and optionally allow users to hardcode instead
		"abstract"       : we could scrape spacedock for the `short_description` it provides and optionally allow users to hardcode instead
		"author"         : we could scrape spacedock for the `author/shared_authors` it provides and optionally allow users to hardcode instead
		"identifier"     : default to the mod's name given by spacedock but allow users to modify
		"license"        : we should only allow from the enumerated list from ckan.schema, possibly defaulting to what we get from `license` via the API but checking against the list https://github.com/KSP-CKAN/CKAN/blob/master/CKAN.schema#L326
		"depends"        : we should allow multiple dependencies to be added and we should restrict options to the list of extant identifiers (including provides), we should also allow min_version to be set per dependency
		"recommends"     : as depends but without min_version support
		"suggests"       : as recommends
		"install"        : by far the most difficult section and most user-reliant section, rather than explain at length I'll link to the appropriate section of the spec: https://github.com/KSP-CKAN/CKAN/blob/master/Spec.md#install
		"resources"
			"homepage"   : we could scrape spacedock for the `website` it provides and optionally allow users to hardcode instead
			"repository" : we could scrape spacedock for the `source_code` it provides and optionally allow users to hardcode instead
		"provides"       : an advanced field that should potentially not be included
	}

GITHUB
------

If a user selects spacedock we should start by asking for repository location and then populating what info we can by scraping the API before accepting user input

API sample: https://api.github.com/repos/snjo/firespitter

For github, netkan can scrape the name, abstract (description), author (owner.login), version, download, resources.homepage (homepage), resources.repository (html_url)

::

	{
		"$kref"          : determined entirely by the github repo given by the user

		"$vref"          : can probably just be a checkbox for users "Does this mod contain a .version file"
		or
		"ksp_version"    : an alternative to $vref, allows a single version of compatibility
		or
		"ksp_version_min": an alternative to $vref and ksp_version, allows a range of ksp versions
		"ksp_version_max":
		
		"spec_version"   : this shouldn't be set by users, we should set the spec_version based on what functions are used
		"name"           : we could scrape github for the `name` it provides and optionally allow users to hardcode instead
		"abstract"       : we could scrape github for the `description` it provides and optionally allow users to hardcode instead
		"identifier"     : default to the mod's name given by spacedock but allow users to modify
		"license"        : we should only allow from the enumerated list from ckan.schema https://github.com/KSP-CKAN/CKAN/blob/master/CKAN.schema#L326
		"resources"
			"homepage"   : we could scrape github for the `homepage` it provides and optionally allow users to hardcode instead
			"repository" : we could scrape github for the `html_url` it provides and optionally allow users to hardcode instead
		"depends"        : we should allow multiple dependencies to be added and we should restrict options to the list of extant identifiers (including provides), we should also allow min_version to be set per dependency
		"recommends"     : as depends but without min_version support
		"suggests"       : as recommends
		"install"        : by far the most difficult section and most user-reliant section, rather than explain at length I'll link to the appropriate section of the spec: https://github.com/KSP-CKAN/CKAN/blob/master/Spec.md#install
		"provides"       : an advanced field that should potentially not be included
	}

NON-KREF
--------

Near all information has to be hand-entered for these mods.

::

	{
		"$vref"          : can probably just be a checkbox for users "Does this mod contain a .version file"
		or
		"ksp_version"    : an alternative to $vref, allows a single version of compatibility
		or
		"ksp_version_min": an alternative to $vref and ksp_version, allows a range of ksp versions
		"ksp_version_max":
		
		"spec_version"   : this shouldn't be set by users, we should set the spec_version based on what functions are used
		"name", "abstract", "identifier", "resources.homepage", "resources.repository"
		"version"        : the mod's version
		"download"       : URL to the mod's download
		"depends"        : we should allow multiple dependencies to be added and we should restrict options to the list of extant identifiers (including provides), we should also allow min_version to be set per dependency
		"recommends"     : as depends but without min_version support
		"suggests"       : as recommends
		"install"        : by far the most difficult section and most user-reliant section, rather than explain at length I'll link to the appropriate section of the spec: https://github.com/KSP-CKAN/CKAN/blob/master/Spec.md#install
		"license"        : we should only allow from the enumerated list from ckan.schema https://github.com/KSP-CKAN/CKAN/blob/master/CKAN.schema#L326
		"provides"       : an advanced field that should potentially not be included
	}