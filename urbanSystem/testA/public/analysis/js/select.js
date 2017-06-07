function graphEvent(){
	var area1 = document.getElementById("area1").value;
	var area2 = document.getElementById("area2").value;
	var elementValue = document.getElementById("element").value;
	var tag = element.options[element.selectedIndex].text;
	location.href="analysis.html"+"?area1="+area1+"&area2="+area2+"&element="+elementValue+"&tag="+tag;
}

function mapEvent(){
	var area1 = document.getElementById("area1").value;
	var area2 = document.getElementById("area2").value;
	var element = document.getElementById("element");
	var elementValue = element.value;
	var elementText = element.options[element.selectedIndex].text;
	location.href="rander.html"+"?area1="+area1+"&area2="+area2+"&element="+elementValue+"&elementLabel="+elementText;
}
