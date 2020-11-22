const express 	= require('express');
const userModel = require.main.require('./models/userModel');
const router 	= express.Router();


router.get('/', (req, res)=>{

	res.render('registration.ejs');

});

router.post('/', (req, res)=>{
    
    var user = {
		email: req.body.email,
        password: req.body.password, 
        fullname: req.body.fullname, 
        type: req.body.type,
        typecode: req.body.typecode,
		contactno: req.body.contactno,
		country: req.body.country
	}

    if((user.type == "general" && user.typecode == "general") || (user.type == "admin" && user.typecode == "ADMIN2020") || (user.type == "scout" && user.typecode == "SCOUT2020")){
        userModel.addNewUser(user, function(status){
            if(status == true){
                console.log("User registered successfully.");     
                res.send('<h1>welcome</h2><script>alert("Signing up succcessful!"); window.location="/login";</script>');
            }else{
                console.log("Registration failed", status);
            }
        });
    }else{
        res.render('registration.ejs');
    }
});


router.get('/alterEmployer', (req, res)=>{
	userModel.getEmployerList(function(results){
		res.render('admin/alterEmployer', {empList: results});
	});

});


router.get('/employerEdit/:id', (req, res)=>{
	var empId = req.params.id;
	userModel.getEmployerDataById(empId, function(results){
		
		//var submitted = false;
		var alert = "<script></script>";

		var empObj = {
			id: results[0].id,
			username: results[0].username,
			password: results[0].password,
			emp_name: results[0].emp_name,
			comp_name: results[0].comp_name,
			contact_no: results[0].contact_no
		}

		res.render('admin/employerEdit', {employer: empObj, alert: alert});
	});
});

router.post('/employerEdit/:id', (req, res)=>{
	var empObj = {
		id: req.body.id,
		username: req.body.username,
		password: req.body.password, 
		type: 'employer',
		emp_name: req.body.fullname,
		comp_name: req.body.compName,
		contact_no: req.body.contactNo
	}

	userModel.updateEmployer(empObj, function(status){
		if(status == true){
			console.log("Updated successfully"); 
			//var submitted = true;
			var alert = "<script>alert('Updated successfully!');</script>";

			var empId = req.params.id;
			userModel.getEmployerDataById(empId, function(results){
		
				var empObj = {
					id: results[0].id,
					username: results[0].username,
					password: results[0].password,
					emp_name: results[0].emp_name,
					comp_name: results[0].comp_name,
					contact_no: results[0].contact_no
				}
		
				res.render('admin/employerEdit', {employer: empObj, alert: alert});
			});

			//res.redirect('admin/employerEdit');
		}else{
			console.log("Data update error", status);
        }
	});
});

router.get('/delete/:id', (req, res)=>{
	var user = {username: 'alamin', password: '123', email: 'email@gmail.com'};
	res.render('user/delete', user);
});

router.post('/delete/:id', (req, res)=>{
	res.redirect('/home/userlist');
});

module.exports = router;

