var url = "http://10.10.240.120:8989/json/survey";
var id;
var treeData = [];
$.ajax({ 
          type: "get", 
          url: url,
          dataType: "json",
		  jsonp:"callback",
          success: function (data) { 
						  dataSource = data.results;
						 // console.log(dataSource);
						 //id = dataSource.id;
						  addTree();
                           }, 
		  error: function (XMLHttpRequest, textStatus, errorThrown) { 
		  alert(errorThrown); 
		 } 
	 });
	
function addTree(){
	$('#tree').treeview({
		//data: tree,         // 数据源
		data: dataSource,
		showCheckbox: false,   //是否显示复选框
		highlightSelected: true,    //是否高亮选中
		nodeIcon: 'glyphicon glyphicon-link',
		emptyIcon: '',    //没有子节点的节点图标
		multiSelect: false,    //多选
		showBorder: false,
		color: "#FFFFFF",
		backColor:"#404040",
		onhoverColor:"#505050",
		
		//点击文件树显示详情
		/* onNodeSelected: function (event, data) {
			$('#title').html(data.text);
			console.log(data);
		} */
		onNodeSelected:function(event,data){
			$('#title').html(data.text);
			id = data.id;
			console.log(id);
			getData();
			$('#data1').html(data.number);
		},
	});
}
//window.onload = addTree();
function getData(){
	if(id != undefined){
		var url = "http://10.10.240.120:8989/json/sample/"+id;
		
		var tableData = [];
		$.ajax({ 
				  type: "get", 
				  url: url,
				  dataType: "json",
				  jsonp:"callback",
				  success: function (data) { 
								  treeData = data.results;
								  console.log(treeData);
								  insertTreeTable();
								   }, 
				  error: function (XMLHttpRequest, textStatus, errorThrown) { 
				  alert(errorThrown); 
				 } 
			 });
	}else{
		var table = document.getElementById("treeDataInsert");
		while(table.hasChildNodes()){ table.removeChild(table.firstChild)};
		table.innerHTML = "请选择具体项进行查看";
	}
}

function insertTreeTable(){
	/* for(var n=0;n<treeData.length;n++){
			tableData[n]=new Array()
			tableData[n].push(treeData[n][1]);
			tableData[n].push(treeData[n][6]);
			tableData[n].push(treeData[n][2]);
			tableData[n].push(treeData[n][4]);
			tableData[n].push(treeData[n][7]);
		}
	console.log(tableData); */
	console.log(treeData);
	var table = document.getElementById("treeDataInsert");
	while(table.hasChildNodes()){ table.removeChild(table.firstChild)};
	for(var i=0;i<treeData.length;i++){
		var tr = document.createElement("tr");
		for(var j=0;j<treeData[i].length;j++){
			var data = document.createTextNode(" "+treeData[i][j]+" ");
			var td = document.createElement("td");
			var pre = document.createElement("pre");
			//td.width=1/treeData[i].length*100+"%";
			td.title = treeData[i][j];
			td.appendChild(pre);
			pre.appendChild(data);
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
}

/* function changeTableStyle(){
	var table = document.getElementById("treeDataInsert");
	console.log(table.style.width);
	if(table.style.width == "700px"){
		table.style.width = "";
	}
	else{
		table.style.width = "700px"; 
	}
} */

var showData = document.getElementById("showData");
var showDiv = document.getElementById("tree");
showData.onclick = function(){
	if(showDiv.style.display == "none"){
		showDiv.style.display = "block";
	}
	else{
		showDiv.style.display = "none";
	}
}

window.onload = function(){
	showDiv.style.display = "none";
}

