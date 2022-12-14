# GEO VM Inventory

Scripts for the auditing and reconciliation of managed vmWare VM CMDB data

## Contents

### vro

  - **Inventory.js**: vRO workflow JavaScript scripting action for extracting managed VM properties as JSON.

### go

  - **json2csv**: Golang program for converting vRO attributes JSON to CSV for import to spreadheet
  - **importCMDB**: Golang program to import CSV files into sqlite3 database and normalize data ([README](go/importCMDB/README.md))

## Public domain

This project is in the worldwide [public domain](LICENSE.md). As stated in [CONTRIBUTING](CONTRIBUTING.md):

> This project is in the public domain within the United States, and copyright and related rights in the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
>
> All contributions to this project will be released under the CC0 dedication. By submitting a pull request, you are agreeing to comply with this waiver of copyright interest.
