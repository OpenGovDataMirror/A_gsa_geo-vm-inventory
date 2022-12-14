package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strconv"
)

// VMProperties ... structure of JSON exported from vRO
type VMProperties struct {
	BlueprintType            int
	IsDeleted                bool
	MachineType              int
	VMTotalMemoryMB          int
	LastPowerOffDate         string
	IsComponent              bool
	VMDNSName                string
	InitiatorType            string
	StoragePath              string
	VMCreationDate           string
	ComponentName            string
	ConnectToVdi             bool
	VMEstimatedUsedSpace     int
	OwnerExists              bool
	VMInitialUsedSpace       int
	IsMissing                bool
	IsTemplate               bool
	NeedCatalogUpdate        bool
	VMCPUs                   int
	BlueprintName            string
	VMTotalStorageGB         int
	RecUpdateTime            string
	VirtualMachineName       string
	GuestOSFamily            string
	LastPowerOnDate          string
	ExpireDays               int
	VMUniqueID               string
	ExternalReferenceID      string `json:"ExternalReferenceId"`
	IsManaged                bool
	IsRogue                  bool
	VirtualMachineState      string
	Notes                    string
	PlatformDetails          string
	VirtualMachineID         string
	IsRunning                bool
	HostReservationID        string
	HostID                   string
	GuestOS                  string
	VMUsedStorageGB          int
	Flags                    int
	VirtualMachineTemplateID string
	IP                       string
}

func main() {
	var inFile, outFile string

	if args := os.Args[1:]; len(args) == 2 {
		inFile = args[0]
		outFile = args[1]
	} else {
		fmt.Printf("Usage: %s inFile outFile\n", os.Args[0])
		return
	}

	jsonDataFromFile, err := ioutil.ReadFile(inFile)

	if err != nil {
		fmt.Println(err)
	}

	var jsonData []VMProperties
	err = json.Unmarshal([]byte(jsonDataFromFile), &jsonData)

	if err != nil {
		fmt.Println(err)
	}

	csvFile, err := os.Create(outFile)

	if err != nil {
		fmt.Println(err)
	}
	defer csvFile.Close()
	writer := csv.NewWriter(csvFile)

	heading := []string{"BlueprintType", "IsDeleted", "MachineType",
		"VMTotalMemoryMB", "LastPowerOffDate", "IsComponent", "VMDNSName",
		"InitiatorType", "StoragePath", "VMCreationDate", "ComponentName",
		"ConnectToVdi", "VMEstimatedUsedSpace", "OwnerExists", "VMInitialUsedSpace",
		"IsMissing", "IsTemplate", "NeedCatalogUpdate", "VMCPUs", "BlueprintName",
		"VMTotalStorageGB", "RecUpdateTime", "VirtualMachineName", "GuestOSFamily",
		"LastPowerOnDate", "ExpireDays", "VMUniqueID", "ExternalReferenceId",
		"IsManaged", "IsRogue", "VirtualMachineState", "Notes", "PlatformDetails",
		"VirtualMachineID", "IsRunning", "HostReservationID", "HostID", "GuestOS",
		"VMUsedStorageGB", "Flags", "VirtualMachineTemplateID", "IP"}
	writer.Write(heading)

	for _, usance := range jsonData {
		var row []string
		row = append(row, strconv.Itoa(usance.BlueprintType))
		row = append(row, strconv.FormatBool(usance.IsDeleted))
		row = append(row, strconv.Itoa(usance.MachineType))
		row = append(row, strconv.Itoa(usance.VMTotalMemoryMB))
		row = append(row, usance.LastPowerOffDate)
		row = append(row, strconv.FormatBool(usance.IsComponent))
		row = append(row, usance.VMDNSName)
		row = append(row, usance.InitiatorType)
		row = append(row, usance.StoragePath)
		row = append(row, usance.VMCreationDate)
		row = append(row, usance.ComponentName)
		row = append(row, strconv.FormatBool(usance.ConnectToVdi))
		row = append(row, strconv.Itoa(usance.VMEstimatedUsedSpace))
		row = append(row, strconv.FormatBool(usance.OwnerExists))
		row = append(row, strconv.Itoa(usance.VMInitialUsedSpace))
		row = append(row, strconv.FormatBool(usance.IsMissing))
		row = append(row, strconv.FormatBool(usance.IsTemplate))
		row = append(row, strconv.FormatBool(usance.NeedCatalogUpdate))
		row = append(row, strconv.Itoa(usance.VMCPUs))
		row = append(row, usance.BlueprintName)
		row = append(row, strconv.Itoa(usance.VMTotalStorageGB))
		row = append(row, usance.RecUpdateTime)
		row = append(row, usance.VirtualMachineName)
		row = append(row, usance.GuestOSFamily)
		row = append(row, usance.LastPowerOnDate)
		row = append(row, strconv.Itoa(usance.ExpireDays))
		row = append(row, usance.VMUniqueID)
		row = append(row, usance.ExternalReferenceID)
		row = append(row, strconv.FormatBool(usance.IsManaged))
		row = append(row, strconv.FormatBool(usance.IsRogue))
		row = append(row, usance.VirtualMachineState)
		row = append(row, usance.Notes)
		row = append(row, usance.PlatformDetails)
		row = append(row, usance.VirtualMachineID)
		row = append(row, strconv.FormatBool(usance.IsRunning))
		row = append(row, usance.HostReservationID)
		row = append(row, usance.HostID)
		row = append(row, usance.GuestOS)
		row = append(row, strconv.Itoa(usance.VMUsedStorageGB))
		row = append(row, strconv.Itoa(usance.Flags))
		row = append(row, usance.VirtualMachineTemplateID)
		writer.Write(row)
	}

	// remember to flush!
	writer.Flush()
}
