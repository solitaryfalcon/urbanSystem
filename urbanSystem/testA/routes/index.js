var express = require('express');
  var router = express.Router();
  var usr=require('dao/dbConnect');
  //var url = require('url');
  /* GET home page. */
  router.get('/', function(req, res) {
      if(req.cookies.islogin){
          req.session.islogin=req.cookies.islogin;
      }
 if(req.session.islogin){
     res.locals.islogin=req.session.islogin;
 }
   res.render('index', { title: 'HOME',test:res.locals.islogin});
 });
 
 
 router.route('/login')
     .get(function(req, res) {
         if(req.session.islogin){
             res.locals.islogin=req.session.islogin;
         }
 
         if(req.cookies.islogin){
             req.session.islogin=req.cookies.islogin;
         }
         res.render('login', { title: '用户登录' ,test:res.locals.islogin});
    })
     .post(function(req, res) {
         client=usr.connect();
         result=null;
         usr.selectFun(client,req.body.username, function (result) {
             if(result[0]===undefined){
                 res.send('没有该用户');
             }else{
				 if(req.body.username==="admin"&&result[0].password===req.body.password){
					 req.session.islogin=req.body.username;
                     res.locals.islogin=req.session.islogin;
                     res.cookie('islogin',res.locals.islogin,{maxAge:60000});
                     res.redirect('/adminHome');
				 }
                 else if(result[0].password===req.body.password){
                     req.session.islogin=req.body.username;
                     res.locals.islogin=req.session.islogin;
                     res.cookie('islogin',res.locals.islogin,{maxAge:60000});
                     res.redirect('/userHome');
                 }else
                 {
                     res.redirect('/login');
                 }
                }
         });
     });
 
 router.get('/logout', function(req, res) {
     res.clearCookie('islogin');
     req.session.destroy();
     res.redirect('/login');
 });
 
 router.get('/home', function(req, res) {
     if(req.session.islogin){
         res.locals.islogin=req.session.islogin;
     }
    if(req.cookies.islogin){
         req.session.islogin=req.cookies.islogin;
     }
     res.render('home', { title: 'Home', user: res.locals.islogin });
 });
 router.get('/adminHome', function(req, res) {
     if(req.session.islogin){
         res.locals.islogin=req.session.islogin;
     }
    if(req.cookies.islogin){
         req.session.islogin=req.cookies.islogin;
     }
     res.render('adminHome', { title: 'adminHome', user: res.locals.islogin });
 });
 
 router.route('/reg')
     .get(function(req,res){
         res.render('reg',{title:'注册'});
     })
     .post(function(req,res) {
         client = usr.connect();
 
         usr.insertFun(client,req.body.username ,req.body.password2,req.body.phoneNum,function (err) {
               //if(err) throw err;
               res.send('注册成功');
         });
     });
	 router.route('/findPw')
     .get(function(req,res){
         res.render('findPw',{title:'找回密码'});
     })
     .post(function(req,res) {
         client = usr.connect();
 
         usr.insertFun(client,req.body.username ,req.body.password2,req.body.phoneNum,function (err) {
               //if(err) throw err;
               res.send('注册成功');
         });
     });
	 
 router.get('/userHome', function(req, res) {
     if(req.session.islogin){
         res.locals.islogin=req.session.islogin;
     }
    if(req.cookies.islogin){
         req.session.islogin=req.cookies.islogin;
     }
     res.render('userHome', { title: 'userHome', user: res.locals.islogin });
 });
 router.get('/map', function(req, res) {
     if(req.session.islogin){
         res.locals.islogin=req.session.islogin;
     }
    if(req.cookies.islogin){
         req.session.islogin=req.cookies.islogin;
     }
     res.render('map', { title: 'map', user: res.locals.islogin });
 });

router.get('/storySearch', function(req, res) {
     var word = req.query.wd;
     client=usr.connect();
     usr.searchStory(client, word, function (results) {
        if(results==''){
            res.send('没有查到该记录');
        }
		else{
			res.render('storySearch', { key: word, result: results });
		}
     });
 });

 module.exports = router;