var url = "http://10.10.240.120:8989/json/sample/80";
var ho_dataSource = [];
var ho_tableData = [];
$.ajax({ 
          type: "get", 
          url: url,
          dataType: "json",
		  jsonp:"callback",
          success: function (data) { 
						  ho_dataSource = data.results;
						 // console.log(ho_dataSource);
						  insertHouseTable();
                           }, 
		  error: function (XMLHttpRequest, textStatus, errorThrown) { 
		  alert(errorThrown); 
		 } 
	 });
function insertHouseTable(){
	for(var n=0;n<ho_dataSource.length;n++){
			ho_tableData[n]=new Array()
			ho_tableData[n].push(ho_dataSource[n][1]);
			ho_tableData[n].push(ho_dataSource[n][6]);
			ho_tableData[n].push(ho_dataSource[n][2]);
			ho_tableData[n].push(ho_dataSource[n][4]);
			ho_tableData[n].push(ho_dataSource[n][7]);
		}
	//console.log(ho_tableData);
	var table = document.getElementById("houseData");
	for(var i=0;i<ho_tableData.length;i++){
		var tr = document.createElement("tr");
		for(var j=0;j<ho_tableData[i].length;j++){
			var data = document.createTextNode(ho_tableData[i][j]);
			var td = document.createElement("td");
			td.title = ho_tableData[i][j];
			td.appendChild(data);
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
}
