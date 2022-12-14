package main

import (
	"database/sql"
	"flag"
	"io"
	"log"
	"os/exec"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	// Get commandline parameters
	dbPath := flag.String("db", "./cmdb_cleanup.db", "path of db file")
	csvFiles := make(map[string]*string)
	csvFiles["snow"] = flag.String("snow", "./snow.csv", "path to ServiceNow CSV file")
	csvFiles["vcac"] = flag.String("vcac", "./vcac.csv", "path to vCAC CSV file")
	csvFiles["vcenter"] = flag.String("vcenter", "./vcenter.csv", "path to vCenter CSV file")
	sqlCommands := ".mode csv\n"

	flag.Parse()

	// Drop tables
	db, err := sql.Open("sqlite3", *dbPath)
	if err != nil {
		log.Fatalf("Error opening %s: %v\n", *dbPath, err)
	}

	for _, s := range []string{"snow", "vcac", "vcenter"} {
		stmt, err := db.Prepare("DROP TABLE IF EXISTS " + s)
		if err != nil {
			log.Fatalf("Error preparing statement: %v\n", err)
		}

		_, err = stmt.Exec()
		if err != nil {
			log.Fatalf("Error dropping table %s: %v\n", s, err)
		}

		sqlCommands = sqlCommands + ".import " + *csvFiles[s] + " " + s + "\n"
	}

	sqlCommands = sqlCommands + normalize

	cmd := exec.Command("sqlite3", *dbPath)

	stdin, err := cmd.StdinPipe()
	if err != nil {
		log.Fatal(err)
	}

	io.WriteString(stdin, sqlCommands)
	stdin.Close()

	out, err := cmd.CombinedOutput()
	if err != nil {
		log.Fatalf("Error running sql script: %v", err)
	}
	log.Printf("%s\n", out)
}
