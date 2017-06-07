function check(){
	if(!document.getElementById) return false;
	if(!document.getElementById("username")) return false;
	if(!document.getElementById("password")) return false;
	var username = document.getElementById("username");
	var pwd = document.getElementById("password");
	if(username.value == "admin" && password.value == "admin")
		return true;
	else
		return false;
}

function login(){
	var warning = document.getElementById("warning");
	var usernull = document.getElementById("usernull");
	var pwdnull = document.getElementById("pwdnull");
	var usernameValue = document.getElementById("username").value;
	var pwdValue = document.getElementById("password").value;
	if(!check()){
		if(usernameValue == null || usernameValue == ""){
			usernull.style.display="";
			pwdnull.style.display ="none";
			warning.style.display="none";
		}
		else if(pwdValue == null || pwdValue == ""){
			pwdnull.style.display ="";
			usernull.style.display="none";
			warning.style.display="none";
		}
		else{
			warning.style.display="";
			usernull.style.display="none";
			pwdnull.style.display ="none";
		}
	}
	else{
		/* var btn = document.getElementById("loginBtn");
		btn.setAttribute("href","index.html");  //Ìæ»»url */
		window.location.replace("index.html");
	}
}

function BindEnter() {
 if (event.keyCode == 13) {
     event.cancelBubble = true;
     event.returnValue = false;
         document.getElementById('loginBtn').click();
   }
}