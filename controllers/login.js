const express 		= require('express');
const userModel		= require.main.require('./models/userModel');
const router 		= express.Router();

router.get('/', (req, res)=>{
	res.render('login/index');
});

router.post('/', (req, res)=>{

	var user = {
		email: req.body.email,
		password: req.body.password
	};

	userModel.validate(user, function(results){
		if(results!=""){
			res.cookie('email', results[0].email); 
			res.cookie('userid', results[0].user_id); 
			res.cookie('type', results[0].type); 
			
			req.session.email=results[0].email; 
			req.session.userid=results[0].user_id;
			req.session.type=results[0].type; 
			
			res.redirect('/customer');

			/* if(type=="employer"){
				res.render('home/empIndex', {username: username, id: id, type: type});
			}else if(type=="admin"){
				res.render('home/adminIndex', {username: username, id: id, type: type});
			}else{
				console.log("Couldn't specify what type of User.");
			}  */

		}else{
			res.redirect('/login');
		}

	});
}); 

module.exports = router;