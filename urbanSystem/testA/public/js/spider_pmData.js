var url = "http://10.10.240.120:8989/json/sample/1";
var pmdataSource = [];
var pmtableData = [];
$.ajax({ 
          type: "get", 
          url: url,
          dataType: "json",
		  jsonp:"callback",
          success: function (data) { 
						  pmdataSource = data.results;
						 // console.log(dataSource);
						  insertPmTable();
                           }, 
		  error: function (XMLHttpRequest, textStatus, errorThrown) { 
		  alert(errorThrown); 
		 } 
	 });
function insertPmTable(){
	for(var n=0;n<pmdataSource.length;n++){
			pmtableData[n]=new Array()
			pmtableData[n].push(pmdataSource[n][2]);
			pmtableData[n].push(pmdataSource[n][15]);
			pmtableData[n].push(pmdataSource[n][21]);
			pmtableData[n].push(pmdataSource[n][13]);
			pmtableData[n].push(pmdataSource[n][17]);
		}
	//console.log(pmtableData);
	var table = document.getElementById("pmData");
	for(var i=0;i<pmtableData.length;i++){
		var tr = document.createElement("tr");
		for(var j=0;j<pmtableData[i].length;j++){
			var data = document.createTextNode(pmtableData[i][j]);
			var td = document.createElement("td");
			td.title = pmtableData[i][j];
			td.appendChild(data);
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
}
