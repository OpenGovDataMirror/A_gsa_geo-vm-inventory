# CMDB Analysis DB #

Golang program to import CSV reports from vRO and ServiceNow to compare CMDB
records for vmWare virtual machines

## Usage ##

***Important: because this is a `CGO` enabled package you are required to set the environment variable `CGO_ENABLED=1` and have a `gcc` compile present within your path.***

### Dependencies ###

- Golang build environment
- gcc
- [go-sqlite3](https://github.com/mattn/go-sqlite3)

Compile and install the import tool

```
export CGO_ENABLED=1
go get github.com/GSA/geo-vm-inventory/go/importCMDB
```

If the csv files are named `snow.csv`, `vcac.csv` and `vcenter.csv` and in the current directory, then simply running the command will create the `cmdb_cleanup.db` database in the current directory, delete the tables (if they exist), import the csv files into the tables and normalize the data.

```
importCMDB
```

The following flags are supported

```
-db string
    path of db file (default "./cmdb_cleanup.db")
-snow string
    path to ServiceNow CSV file (default "./snow.csv")
-vcac string
    path to vCAC CSV file (default "./vcac.csv")
-vcenter string
    path to vCenter CSV file (default "./vcenter.csv")
```
