
var url = "http://10.10.240.120:8989/json/sample/78";
var ac_dataSource = [];
var ac_tableData = [];
$.ajax({ 
          type: "get", 
          url: url,
          dataType: "json",
		  jsonp:"callback",
          success: function (data) { 
						  ac_dataSource = data.results;
						 // console.log(ac_dataSource);
						  insertActivityTable();
                           }, 
		  error: function (XMLHttpRequest, textStatus, errorThrown) { 
		  alert(errorThrown); 
		 } 
	 });
function insertActivityTable(){
	for(var n=0;n<ac_dataSource.length;n++){
			ac_tableData[n]=new Array()
			ac_tableData[n].push(ac_dataSource[n][1]);
			ac_tableData[n].push(ac_dataSource[n][6]);
			ac_tableData[n].push(ac_dataSource[n][2]);
			ac_tableData[n].push(ac_dataSource[n][4]);
			ac_tableData[n].push(ac_dataSource[n][7]);
		}
	//console.log(ac_tableData);
	var table = document.getElementById("activityData");
	for(var i=0;i<ac_tableData.length;i++){
		var tr = document.createElement("tr");
		for(var j=0;j<ac_tableData[i].length;j++){
			var data = document.createTextNode(ac_tableData[i][j]);
			var td = document.createElement("td");
			td.title = ac_tableData[i][j];
			td.appendChild(data);
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
}
