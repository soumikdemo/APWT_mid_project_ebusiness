const express 	= require('express'); 
const { check, validationResult } = require('express-validator');
const userModel = require.main.require('./models/userModel');
const router 	= express.Router();

router.get('*',  (req, res, next)=>{
	if(req.cookies['email'] == null){
		res.redirect('/login');
	}else{
		next();
	}
});


router.get('/img',  (req, res, next)=>{
	res.render('customer/img');
});

router.post('/img', (req, res) => {

	var customerid = req.cookies['customerid'];
    var obj = {
        customer_id: customerid,
        image: "/pictures/" + req.files.filename
		}

	userModel.updateImg(str, function(results){
		if(results){
			console.log("image updated.");
			res.redirect('customer/');

		}else{
			console.log("ERROR updating img");
		}

	});

});



router.get('/search',function(req,res){
    res.render('search.ejs');
});

// search function    
router.post('customer/search',function(req,res){
    var str = {
        stringPart:req.body.typeahead
    }

	userModel.search(str, function(rows){
		var data=[];
        for(i=0;i<rows.length;i++)
        {
            data.push(rows[i].product_name);
        }
        res.send(JSON.stringify(data));
	});

/*     db.query('SELECT product_name FROM product WHERE product_name LIKE "%'+str.stringPart+'%"',function(err, rows, fields) {
		if (err) throw err; */
		
});




router.get('/ajax', function(req, res){
	var list = [];
    res.render('ajax', {title: 'An Ajax Example', list: list});
});
router.post('/ajax', function(req, res){
	var str = {
        stringPart: req.body.quote
    }
	//console.log(str.stringPart);
	userModel.search(str, function(rows){

		if(rows!=""){
			
			var data=[];
			for(i=0;i<rows.length;i++)
			{
				data.push(rows[i].product_name);
			}
			//console.log(data);
			res.render('ajax.ejs', {title: 'An Ajax Example', list: data});	
		}else{
			console.log("ERROR");
		}
		
        //res.send(JSON.stringify(data));
	});

    
});


router.get('/viewproduct/:orderid', (req, res)=>{
	var orderid = req.params.orderid;
	res.send("incomplete.");
});

router.get('/cart', (req, res)=>{
	var customerid = req.cookies['customerid'];

	userModel.getCartDataByCustomerId(customerid, function(results){
		userModel.getProductInfo(function(product){
			res.render('customer/cart', {list: results, prod: product, custid: customerid});
		});		
	});
});

router.get('/cart/:custid', (req, res)=>{
	var customerid = req.params.custid; 

	userModel.getCartDataByCustomerId(customerid, function(results){
		results.forEach(element => { 
			userModel.getSellerUseridByProductid(element.product_id, function(set){
				var prodid = element.product_id; 
				var selleruserid = set[0].user_id; 
				var quantity = element.quantity;
				var order_status = "pending";
				var paid = 1;
				var date = new Date().toISOString().slice(0, 10);

				var obj = {
					customer_id: customerid,
					user_id: selleruserid,
					product_id: prodid,
					quantity: quantity,
					order_status: order_status,
					paid: paid,
					date: date
				}

				userModel.cartToCreateOrder(obj, function(status){
					if(status){
						console.log("product ordered.");

						userModel.cancelProductFromCartByCustomerid(customerid, function(results){
							if(results){
								console.log("product ordered from cart.");
							}else{
								console.log("ERROR removing product from cart.");
							}		
						});						
					}else{
						console.log("ERROR ordering product");
					}
				})
				//console.log(obj);
				
			});
		});
	});	

	res.redirect('/customer/');
});

router.get('/remove_from_cart/:id', (req, res)=>{
	var cartid = req.params.id;
	userModel.cancelProductFromCartByCartid(cartid, function(results){
		if(results){
			res.redirect('/customer/cart');
		}else{
			console.log("ERROR removing product from cart.");
		}		
	});
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


router.get('/order_history', (req, res)=>{
	var customerid = req.cookies['customerid'];

	userModel.getOrderHistoryByCustomerId(customerid, function(results){
		userModel.getProductInfo(function(product){
			res.render('customer/order_history', {list: results, prod: product});
		});		
	});
});


router.get('/wishlist', (req, res)=>{
	var customerid = req.cookies['customerid'];

	userModel.getWishlistProductByCustomerId(customerid, function(results){
		userModel.getProductInfo(function(product){
			res.render('customer/wishlist', {list: results, prod: product});
		});		
	});
});

router.get('/remove_from_wishlist/:id', (req, res)=>{
	var productid = req.params.id;
	userModel.cancelWishlistProduct(productid, function(results){
		if(results){
			res.redirect('/customer/wishlist');
		}else{
			console.log("ERROR removing product from wishlist.");
		}		
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

router.post('/settings', [
		check('name', 'Name must be 3+ characters long and less than 50.')
			.exists()
			.isLength({ min: 3, max: 50 }),
		check('address', 'Address must be less than 100 characters.')
			.exists()
			.isLength({ min: 3, max: 100 }),
		check('phoneno', 'Phone number not valid') 
			.isMobilePhone()
			.isLength({ min: 5, max: 15})
	], (req, res)=>{

		const errors = validationResult(req)
		if(!errors.isEmpty()) { 

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

				const alert = errors.array();
				console.log(alert);
				res.render('customer/settings', {dt: data, alert: alert});
			});

		}else{

			var custid = Number(req.body.id);
			console.log(typeof custid);
			console.log(req.body.dob);

			var date;
			date = new Date(req.body.dob);
			date = date.getUTCFullYear() + '-' +
			('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
			('00' + date.getUTCDate()).slice(-2);
			console.log(typeof date);
			
			var formdata = {
				id: custid,
				name: req.body.name, 
				address: req.body.address,
				dob: date,
				phoneno: req.body.phoneno
			}

			userModel.updateCustomerData(formdata, function(status){
				if(status == true){
					console.log("Data updated successfully"); 
					//var submitted = true;

					res.redirect('/customer');
				}else{
					console.log("Data update error", status);
				}
			});
		}
});




router.get('/report_problem', (req, res)=>{
	res.render('customer/report_problem');
});







module.exports = router;