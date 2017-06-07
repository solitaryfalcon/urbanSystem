var url = "http://10.10.240.120:8989/json/sample/2";
var dataSource = [];
var tableData = [];
$.ajax({ 
          type: "get", 
          url: url,
          dataType: "json",
		  jsonp:"callback",
          success: function (data) { 
						  dataSource = data.results;
						 // console.log(dataSource);
						  insertWaterTable();
                           }, 
		  error: function (XMLHttpRequest, textStatus, errorThrown) { 
		  alert(errorThrown); 
		 } 
	 });
function insertWaterTable(){
	for(var n=0;n<dataSource.length;n++){
			tableData[n]=new Array()
			tableData[n].push(dataSource[n][1]);
			tableData[n].push(dataSource[n][6]);
			tableData[n].push(dataSource[n][2]);
			tableData[n].push(dataSource[n][4]);
			tableData[n].push(dataSource[n][7]);
		}
	//console.log(tableData);
	var table = document.getElementById("waterData");
	for(var i=0;i<tableData.length;i++){
		var tr = document.createElement("tr");
		for(var j=0;j<tableData[i].length;j++){
			var data = document.createTextNode(tableData[i][j]);
			var td = document.createElement("td");
			td.title = tableData[i][j];
			td.appendChild(data);
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
}
