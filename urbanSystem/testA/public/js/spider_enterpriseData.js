var url = "http://10.10.240.120:8989/json/sample/79";
var en_dataSource = [];
var en_tableData = [];
$.ajax({ 
          type: "get", 
          url: url,
          dataType: "json",
		  jsonp:"callback",
          success: function (data) { 
						  en_dataSource = data.results;
						 // console.log(en_dataSource);
						  insertEnterTable();
                           }, 
		  error: function (XMLHttpRequest, textStatus, errorThrown) { 
		  alert(errorThrown); 
		 } 
	 });
function insertEnterTable(){
	for(var n=0;n<en_dataSource.length;n++){
			en_tableData[n]=new Array()
			en_tableData[n].push(en_dataSource[n][1]);
			en_tableData[n].push(en_dataSource[n][6]);
			en_tableData[n].push(en_dataSource[n][2]);
			en_tableData[n].push(en_dataSource[n][4]);
			en_tableData[n].push(en_dataSource[n][7]);
		}
	//console.log(en_tableData);
	var table = document.getElementById("enterpriseData");
	for(var i=0;i<en_tableData.length;i++){
		var tr = document.createElement("tr");
		for(var j=0;j<en_tableData[i].length;j++){
			var data = document.createTextNode(en_tableData[i][j]);
			var td = document.createElement("td");
			td.title = en_tableData[i][j];
			td.appendChild(data);
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
}
