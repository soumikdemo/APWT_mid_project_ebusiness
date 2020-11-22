const express 	= require('express');
const userModel = require.main.require('./models/userModel');
const router 	= express.Router();

router.get('*',  (req, res, next)=>{
	if(req.cookies['email'] == null){
		res.redirect('/login');
	}else{
		next();
	}
});

router.get('/', (req, res)=>{
	//var userid = req.session.userid;
	var userid = req.cookies['userid'];

	userModel.getCustomerId(req.session.userid, function(result){
		res.cookie('customerid', result[0].customer_id); 
	});

	userModel.getSingleUserData(userid, function(results){

		var data = {
			customerid: results[0].customer_id,
			userid: results[0].user_id,
			name: results[0].name,
			email: results[0].email,
			address: results[0].address,
			dob: results[0].dob,
			phoneno: results[0].phone_no,
			blockstatus: results[0].block_status, 
			membershipstatus: results[0].membership_status,
			shoppingpoint: results[0].shopping_point,
			profilepic: results[0].profile_pic, 
			amount: results[0].amount
		}

		res.render('customer/index', {dt: data});
	});

});


router.get('/pending_order', (req, res)=>{

	var customerid = req.cookies['customerid'];
	var result1 = [];
	var result2 = {};
	let arrayProductId = [];
	var arrayProductName = []; 

	userModel.getPendingOrdersByCustomerId(customerid, function(results){

/* 		var array = [];
		for(i=0 ; i<results.length ; i++){
			array.push(results[i]);
		} */

/* 		var normalResults = results.map((mysqlObj, index) => {
			return Object.assign({}, mysqlObj);
		}); */
		
/* 		results.forEach(function(element){
			arrayProductId.push(element.product_id);
		});
		console.log(arrayProductId); */

		userModel.getProductInfo(function(product){
			res.render('customer/pending_order', {list: results, prod: product});
		});

/* 		console.log(typeof results);
		result1 = results;
		console.log(typeof result1); */
		
	});
});

router.get('/order_history', (req, res)=>{
	var customerid = req.cookies['customerid'];

	userModel.getOrderHistoryCustomerId(customerid, function(results){
		userModel.getProductInfo(function(product){
			res.render('customer/order_history', {list: results, prod: product});
		});		
	});
});

router.get('/settings', (req, res)=>{
	var customerid = req.cookies['customerid'];

	userModel.getSingleUserDataByCustomerId(customerid, function(results){
		var data = {
			customerid: results[0].customer_id,
			userid: results[0].user_id,
			name: results[0].name,
			email: results[0].email,
			address: results[0].address,
			dob: results[0].dob,
			phoneno: results[0].phone_no,
			blockstatus: results[0].block_status, 
			membershipstatus: results[0].membership_status,
			shoppingpoint: results[0].shopping_point,
			profilepic: results[0].profile_pic, 
			amount: results[0].amount
		}

		res.render('customer/settings', {dt: data});
	});
});

router.post('/settings', (req, res)=>{
    
    var formdata = {
		id: req.body.id,
		name: req.body.name, 
		address: req.body.address,
		dob: req.body.dob,
		phoneno: req.body.phoneno
	}

	userModel.updateCustomerData(formdata, function(status){
		if(status == true){
			console.log("Data inserted successfully"); 
			var submitted = true;

			res.render('admin/create', {submitted: submitted});
		}else{
			console.log("Data insertion error", status);
        }
	});
});




router.get('/report_problem', (req, res)=>{
	res.render('customer/report_problem');
});


router.get('/cancelorder/:orderid', (req, res)=>{
	var orderid = req.params.orderid;
	userModel.cancelOrderByOrderId(orderid, function(results){
		if(results){
			res.redirect('/customer/pending_order');
		}else{
			console.log("ERROR canceling order.");
		}		
	});
});




module.exports = router;