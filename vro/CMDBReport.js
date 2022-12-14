var VERBOSE = true;

///////////////////////////////////
// ServiceNow REST API Functions //
///////////////////////////////////

function configRestHost() {
	if (VERBOSE) {System.log("Creating Transient REST host")};

	var restHost = RESTHostManager.createHost("DynamicRequest");
	var transientHost = RESTHostManager.createTransientHostFrom(restHost);
	transientHost.url = "https://" + serviceNowHostname;

	// Basic Auth
	if (serviceNowUserid != null && serviceNowUserid != "") {
		var authParams = ["Per User Session", serviceNowUserid, serviceNowPasswd];
		var authenticationObject = RESTAuthenticationManager.createAuthentication("Basic", authParams);
		transientHost.authentication = authenticationObject;
	}
	return transientHost;
}

function executeRequest(request) {
	if (VERBOSE) {
		System.log("Request URL: " + request.url);
		System.log("Base URL: " + request.host.url);
	}
	if (serviceNowUserid != null && serviceNowUserid != "") {
	    if (VERBOSE) {System.log("Executing REST request with basic auth credentials: " + serviceNowUserid)};
	    response = request.executeWithCredentials(serviceNowUserid, serviceNowPasswd);
	} else {
		if (VERBOSE) {System.log("Executing REST request with no credentials")};
	    response = request.execute();
	}
  	// if (VERBOSE) {logResults(response)};
	return response;
}

function logResults(response) {
	System.log("Status code: " + response.statusCode);
	System.log("Headers: " + response.getAllHeaders());
	var obj = JSON.parse(response.contentAsString);
	System.log("Content as string: " + JSON.stringify(obj, null, 2));
}

function queryCMDB(host) {
	var table = "cmdb_ci_server";
	var query = "manufacturer%3D9c7c514f51e7900079b3670b68d5a245%5EORvirtual%3Dtrue";
	var requestUrl = "https://" +
			serviceNowHostname +
			"/api/now/table/" +
			table +
			"?sysparm_query=" + query +
			"&sysparm_display_value=true" +
			"&sysparm_fields=" +
				"sys_id,serial_number,name,manufacturer,os,assigned_to,sys_created_on," +
				"sys_updated_on,sys_class_name,u_sub_class,u_active,cpu_count,dns_domain," +
				"disk_space,hardware_status,host_name,ip_address,virtual,u_last_updated," +
				"os_version,operational_status,ram,u_static_ip_address,u_vra_uid,vendor," +
				"sys_created_by,discovery_source,fqdn,model_id,model_number,sys_updated_by," +
				"os_address_width,os_domain,os_service_pack";
	if (VERBOSE) {System.log("Request full URL: " + requestUrl)};
	var request = host.createRequest("GET", requestUrl);
	request.contentType = "application/json";
	var response = executeRequest(request);
	var str = response.contentAsString;
	var obj = JSON.parse(str);
	var result = obj["result"];
	return result;
}

function sendEMail(objects) {
	System.log("Sending email");
    // EmailMessage
    var email = new EmailMessage();
    email.fromAddress = fromAddress;
    email.fromName = fromName;
    email.smtpHost = "159.142.1.100";
    email.smtpPort = 25;
    var cur_date = new Date().toJSON().slice(0,10);
    email.subject = "Report: vmWare Virtual Machine Entities (" + cur_date + ")";
	//Get the content of the Resource Element and parse
	json_file = distroListResource.getContentAsMimeAttachment();
	var distroList = JSON.parse(json_file.content).join();
	if (VERBOSE) { System.log("distroList: " + distroList) }
    email.toAddress = distroList;
	email = addAttachments(email, objects);
    email.sendMessage();
}

function addAttachments(email, objects) {
    var date_time = new Date().toJSON().slice(0,19) + 'Z';
	keys = Object.keys(objects);
	keys.forEach(function (key) {
	    // CSV attachment
	    var csv = new MimeAttachment();
		csv.name = key + "_" + date_time + ".csv";
	    csv.content = getCsvLines(objects[key]);
    	email.addMimePart(csv, "text/csv");
	});
	return email;
}

function getCsvLines(input) {
	System.log("Creating CSV string from array");
    var CSV_SEPARATOR = ',';
    var headers = Object.keys(input[0]);
	var csv = headers.join(CSV_SEPARATOR);
    input.forEach(function (obj) {
		var line = [];
		headers.forEach(function (key) {
			if ((typeof obj[key] === "string") && (obj[key].search(/,/) > -1)) {
				line.push('"' + obj[key] + '"');
			} else if (typeof obj[key] === 'object' && obj[key] !== null) {
				if ("display_value" in obj[key]) {
					line.push('"' + obj[key]["display_value"] + '"');
				} else if ("link" in obj[key]) {
					line.push(obj[key]["link"]);
				} else {
					line.push(obj[key]);
				}
			} else {
				line.push(obj[key]);
			}
		});
		csv += "\n" + line.join(CSV_SEPARATOR);
	});
	return csv;
}

function serialNumberFormat(uuid) {
	uuid = uuid.replace(/-/g, "");
	f = "VMware-";
	// var f = "";
	for (var i = 0; i <= 12; i +=2) {
		f = f + uuid.substring(i, i+2) + " ";
	}
	f = f + uuid.substring(14,16) + "-" + uuid.substring(16,18);
	for (var i = 18; i < uuid.length; i += 2) {
		f = f + " " + uuid.substring(i, i+2);
	}
	return f;
}

function getVmsProps(vms) {
	// Examining properties in VcVirtualMachine object
	System.log("Getting properties in VcVirtualMachine object");
	var list = [];
	var fields = [
		"name", "displayName", "id", "instanceId", "ipAddress", "biosId", "connectionState", "cpu",
		"guestMemoryUsage", "guestOS", "hostName", "isTemplate", "mem", "memory", "productFullVersion",
		"productName", "productVendor", "state", "totalStorage", "type", "unsharedStorage", "vimId",
		"vimType", "vmToolsStatus", "vmToolsVersionStatus", "vmVersion"
	];
	vms.forEach(function (vm) {
		var props = new Properties();
		fields.forEach(function (key) {
			props[key] = vm[key];
		});
		props["serial_number"] = serialNumberFormat(props["biosId"]);
		try {
			props["parent"] = vm.parent.name;
		} catch(err) {
			System.log("###WARNING###: " + props["name"] + ": " + err);
			props["parent"] = "null";
		}
		cluster = getCluster(vm);
		props["cluster"] = cluster["cluster"].name;
		props["generation"] = cluster["generation"];
		list.push(props);
	});
	return list;
}

function getCluster(vm) {
	// Returns the cluster of a given vCenter VM
	// 
	// For vRO 7.0+/vCenter 6.0+
	//
	// Function Inputs:
	// vm - VC:VirtualMachine - vCenter VM
	//
	// Return type: Properties
	//  cluster: VC:ClusterComputeResoure - the cluster to which the VM belongs
	//  generation: integer - number of parents
	
	var obj = {};
	obj["cluster"] = vm.runtime.host;
	obj["generation"] = 0;
	while (obj["cluster"] !== null && ! (obj["cluster"] instanceof VcClusterComputeResource)) {
	    obj["cluster"] = obj["cluster"].parent;
		obj["generation"]++;
	}
	// System.log("VcClusterComputeResource of VM: " + obj["cluster"].name);
	
	return obj;
}

function getVMEntitiesList() {
	System.log("Getting Virtual Machine Entities List");
	var vcacHost = Server.findAllForType("vCAC:VCACHost")[0];
	var MODEL_MANAGEMENTMODELENTITIES = "ManagementModelEntities.svc";
	var ENTITYSET_VIRTUALMACHINES = "VirtualMachines";
	var virtualMachinesQueryProperties = new Properties();
	var allVirtualMachineEntitiesList = vCACEntityManager.readModelEntitiesByCustomFilter(vcacHost.id, MODEL_MANAGEMENTMODELENTITIES, ENTITYSET_VIRTUALMACHINES, virtualMachinesQueryProperties, null);
	System.log("VM Entities count: " + allVirtualMachineEntitiesList.length);
	var virtualMachineEntitiesList = [];
	for each(var virtualMachine in allVirtualMachineEntitiesList) {
			var props = virtualMachine.getProperties();
			virtualMachineEntitiesList.push(props);
	}
	return virtualMachineEntitiesList
}

//////////////////
// Main Program //
//////////////////

var results = {};
System.log("Start");

System.log("Getting all VMs from vCenter");
var vms = VcPlugin.getAllVirtualMachines();
results["vcenter"] = getVmsProps(vms);

results["vcac"] = getVMEntitiesList();
System.log("VcVirtualMachine count: " + vms.length);

var restHost = configRestHost();
results["snow"] = queryCMDB(restHost);

sendEMail(results);

System.log("Done");