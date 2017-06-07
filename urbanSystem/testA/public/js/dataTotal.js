var url = "http://10.10.240.120:8989/json/all";
$.ajax({ 
          type: "get", 
          url: url,
          dataType: "json",
		  jsonp:"callback",
          success: function (data) { 
						  dataTotal = data.results;
						  addData();
                           }, 
		  error: function (XMLHttpRequest, textStatus, errorThrown) { 
		  alert(errorThrown); 
		 } 
	 });
	 
function addData(){
/* 	var d = document.getElementById("dataTotal");
	d.innerHTML = dataTotal.count; */
	$('#dataTotal').html(dataTotal.count);
	console.log("数据总条数："+dataTotal.count);
}