var url = "http://10.10.240.120:8989/json/sample/82";
var re_dataSource = [];
var re_tableData = [];
$.ajax({ 
          type: "get", 
          url: url,
          dataType: "json",
		  jsonp:"callback",
          success: function (data) { 
						  re_dataSource = data.results;
						 // console.log(re_dataSource);
						  insertRestTable();
                           }, 
		  error: function (XMLHttpRequest, textStatus, errorThrown) { 
		  alert(errorThrown); 
		 } 
	 });
function insertRestTable(){
	for(var n=0;n<re_dataSource.length;n++){
			re_tableData[n]=new Array()
			re_tableData[n].push(re_dataSource[n][1]);
			re_tableData[n].push(re_dataSource[n][6]);
			re_tableData[n].push(re_dataSource[n][2]);
			re_tableData[n].push(re_dataSource[n][4]);
			re_tableData[n].push(re_dataSource[n][7]);
		}
	//console.log(re_tableData);
	var table = document.getElementById("restaurantData");
	for(var i=0;i<re_tableData.length;i++){
		var tr = document.createElement("tr");
		for(var j=0;j<re_tableData[i].length;j++){
			var data = document.createTextNode(re_tableData[i][j]);
			var td = document.createElement("td");
			td.title = re_tableData[i][j];
			td.appendChild(data);
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
}
