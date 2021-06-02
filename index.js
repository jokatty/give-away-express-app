import express, { response } from 'express';
import ejs from 'ejs';
import bodyParser from 'body-parser';
import pg from 'pg';
import jsSHA from 'jssha';
import cookieParser from 'cookie-parser';
import axios from 'axios';

const { Client } = pg;
const { Pool } = pg;

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//  configure database
const pgConnectionConfig = {
  user: 'jyotikattani',
  host: 'localhost',
  database: 'give_away',
  port: '5432',
};

const client = new Client(pgConnectionConfig);
const pool = new Pool(pgConnectionConfig);
client.connect();

/**
 * callback function for index route. renders index page
 * @param {string} req - route's request.
 * @param {string} res - route's response.
 */
function renderIndexPage(req, res) {
  res.render('index');
}

/**
 * callback function for register route. renders user registration page.
 * @param {string} req - route's request.
 * @param {string} res - route's response.
 */
function registerUser(req, res) {
  res.render('register');
}

/**
 * callback function for register post route. fetch user form data and save in db.
 * @param {string} req - route's request.
 * @param {string} res - route's response.
 */
function handleRegistration(req, res) {
  const { fname, lname, email } = req.body;
  console.log(fname + lname + email);
  // hash user password
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  shaObj.update(req.body.pwd);
  const hashedPassword = shaObj.getHash('HEX');
  const query = `INSERT INTO users (first_name, last_name, email, password) VALUES ('${fname}', '${lname}', '${email}', '${hashedPassword}')`;
  pool.query(query, (err, result) => {
    if (err) {
      console.log(`insert query error:${err}`);
      return;
    }
    console.log(result);
    res.send('this page will direct user to their dashboard');
  });
}

function loginUser(req, res) {
  res.render('login');
}

function handleLogin(req, res) {
  const { email, pwd } = req.body;
  pool.query(`SELECT * FROM users WHERE email = '${email}'`, (err, result) => {
    if (err) {
      console.log('error in executing query.', err.stack);
      res.status(503).send(result.rows);
      return;
    }
    if (result.rows.length === 0) {
      res.status(403).send('login failed');
      return;
    }

    const user = result.rows;
    console.log(result.rows[0]);
    const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
    shaObj.update(req.body.pwd);
    const hashedPassword = shaObj.getHash('HEX');
    console.log(`user's saved password: ${user[0].password}`);
    console.log(`hashed password ${hashedPassword}`);

    if (user[0].password !== hashedPassword) {
      res.status(403).send('login failed');
      return;
    }
    res.cookie('isLoggedIn', true);
    res.cookie('userName', `${user[0].first_name}`);
    res.send('logged in');
  });
}

function createListing(req, res) {
  const { isLoggedIn, userName } = req.cookies;
  if (isLoggedIn === 'true') {
    res.render('listing');
  } else {
    alert('please login to list a product');
    res.render('register');
  }
}
function handleListing(req, res) {
  const {
    productCategory, productName, productDescription, productImageInfo,
  } = req.body;
  const listingBy = req.cookies.userName;
  const query = `INSERT INTO listings(product_category, product_name, product_description, product_image_info, posted_by, is_available) VALUES ('${productCategory}', '${productName}', '${productDescription}', '${productImageInfo}', '5', 'true') `;
  client.query(query).then((result) => {
    console.log(result);
  }).catch((err) => {
    console.log(err.stack);
  });
}

function displayCategoryPage(req, res) {
  const categoryName = req.params.category;
  const query = `SELECT * FROM listings WHERE product_category = '${categoryName}'`;
  client.query(query).then((result) => {
    console.log(result);
    // res.send(result.rows);
    res.render('category', { productInfo: result.rows, category: categoryName });
  }).catch((err) => {
    console.log(err.stack);
  });
}

function handleItemRequest(req, res) {
  // res.render('item-request');
  res.send('thanks for requesting the item. List owner will get in touch with you');
}
app.get('/', renderIndexPage);
app.get('/register', registerUser);
app.get('/login', loginUser);
app.get('/listing', createListing);
app.get('/listing/:category', displayCategoryPage);
app.get('/request-item', handleItemRequest);
// post routes
app.post('/register', handleRegistration);
app.post('/login', handleLogin);
app.post('/listing', handleListing);
const PORT = 3004;
app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
