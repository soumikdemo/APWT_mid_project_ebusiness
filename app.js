//declaration
const express 			= require('express');	
const bodyParser 		= require('body-parser');
const exSession 		= require('express-session');
const cookieParser 		= require('cookie-parser');

const registration      = require('./controllers/registration');
const login				= require('./controllers/login');
const logout			= require('./controllers/logout');
const customer			= require('./controllers/customer');

const app				= express();
const port				= 3000;

//configuration
app.set('view engine', 'ejs');


//middleware
//app.use('/abc', express.static('assets'));
app.use("/public", express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(exSession({secret: 'secret value', saveUninitialized: true, resave: false}));


app.use('/registration', registration);
app.use('/login', login);
app.use('/customer', customer);
app.use('/logout', logout);


//router
app.get('/', (req, res)=>{
	res.render('homepage.ejs'); 
});

//server startup
app.listen(port, (error)=>{
	console.log('server strated at '+port);
});