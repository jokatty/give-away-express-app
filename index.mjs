import express, { response } from 'express';
import ejs from 'ejs';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import axios from 'axios';
import multer from 'multer';
import methodOverride from 'method-override';
import moment from 'moment';
import bindRoutes from './routes/routes.mjs';
// set the name of the upload directory
const multerUpload = multer({ dest: 'uploads/' });

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));

/**
 * callback function for '/listing' post route.
 * update the listings table with the user input data.
 * use 'multer' for storing user generated data in uploads dir.
 */
function handleListing(req, res) {
  console.log('request came in');
  console.log(req.file);
  const {
    productCategory, productName, productDescription,
  } = req.body;
  const { userId } = req.cookies;

  const query = `INSERT INTO listings(product_category, product_name, product_description, product_image_info, user_id, is_available) VALUES ('${productCategory}', '${productName}', '${productDescription}', '${req.file.filename}', '${userId}', 'true') `;

  // user promises for nested queries
  pool.query(query).then((result) => {
    console.log(result);
    return pool.query(`SELECT * FROM listings WHERE product_category = '${productCategory}'`);
  }).then((selectResult) => {
    console.log(selectResult);
    const category = `${productCategory[0].toUpperCase()}${productCategory.slice(1)}`;
    // to direct user to the product category page they posted
    // res.render('category', { productInfo: selectResult.rows, category });
    res.redirect('/dashboard/added-product');
  })
    .catch((err) => {
      console.log(err.stack);
    });
}

/**
 * callback function for '/request-item'.
 * checks for user logged in status.
 * fetches requested product's information from route params
 * updates the 'requests' table in db with the new requests.
 */
function handleItemRequest(req, res) {
  if (!req.cookies.isLoggedIn) {
    res.cookie('requestItem', 'true');
    res.render('guest-user');
    return;
  }
  // params passes the listing_id
  const { productInfo } = req.params;
  console.log(productInfo);
  const listingId = productInfo;
  const { userId } = req.cookies;
  const query = `INSERT INTO requests (listing_id, user_id) VALUES ('${listingId}', '${userId}')`;
  pool.query(query).then(() => {
    res.render('request-confirmation');
  }).catch((err) => { console.log(err); });
}

/**
 * callback function for 'dashboard/:type'.
 * based on route param 'type' renders either all requests or all added-items page.
 */

function renderCustomDashboard(req, res) {
  if (req.params.type === 'request') {
    const { userId, userName } = req.cookies;
    console.log(userId);
    const query = `SELECT * FROM requests JOIN listings ON listings.id = requests.listing_id WHERE requests.user_id = '${userId}' `;
    pool.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(result);
      const date = result.rows.map((listing) => (moment(listing.created_at).from()));
      res.render('dashboard-request', { requestedProducts: result.rows, userName, date });
    });
  }
  if (req.params.type === 'added-product') {
    const { userId, userName } = req.cookies;
    const query = `SELECT * FROM listings WHERE user_id = '${userId}'`;
    pool.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return err;
      }
      console.log(result);
      const date = result.rows.map((listing) => (moment(listing.created_at).from()));
      res.render('dashboard-added-product', { listedProducts: result.rows, userName, date });
    });
  }
}

/**
 * callback function for '/dashboard' route.
 * renders user's dashboard with the all transactions history.
 * quries listings table and requests table.
 */
function renderUserDashboard(req, res) {
  const { userId } = req.cookies;
  let listingResult;
  let requestResult;
  let nav = '';
  const { userName } = req.cookies;
  if (userName) {
    nav = 'index-loggedin-nav';
  } else {
    nav = 'index-nav';
  }

  const query = `SELECT * FROM listings WHERE user_id = '${userId}'`;
  // use of promisses for nested queries.
  pool.query(query).then((result) => {
    listingResult = result;
    return pool.query(`SELECT * FROM listings JOIN requests ON requests.listing_id =listings.id WHERE requests.user_id = '${userId}'`);
  }).then((selectResult) => {
    requestResult = selectResult;
    console.log(selectResult);
    res.render('dashboard-user', {
      listedProducts: listingResult.rows, requestedProducts: requestResult.rows, nav, userName,
    });
  }).catch((err) => { console.log(err); });
}

/**
 * callback function for '/logout' post route
 * clear cookies to log out the user.
 * render logout confirmation page.
 */
function handleLogOut(req, res) {
  res.clearCookie('userName');
  res.clearCookie('isLoggedIn');
  res.clearCookie('userId');
  res.render('logout');
}

/**
 * callback function for '/delete' route
 * delete the product from the listings table in db.
 */
function handleDeleteReq(req, res) {
  if (req.params.item === 'added-product') {
    const { productId } = req.body;
    const deleteQuery = `DELETE FROM listings WHERE id = '${productId}'`;
    pool.query(deleteQuery, (err, result) => {
      if (err) {
        console.log(err);
        return;
      }
      res.redirect('/dashboard/added-product');
    });
  } else if (req.params.item === 'requested-product') {
    const { productId } = req.body;
    const deleteQuery = `DELETE FROM listings WHERE id = '${productId}'`;
    pool.query(deleteQuery, (err, result) => {
      if (err) {
        console.log(err);
        return;
      }
      res.redirect('/dashboard/request');
    });
  }
}

/**
 * callback function for '/product' route
 * renders complete information about the product
 */
function renderProductInfo(req, res) {
  let nav = '';
  const { userName } = req.cookies;
  if (userName) {
    nav = 'index-loggedin-nav';
  } else {
    nav = 'index-nav';
  }
  const productId = req.params.id;
  const query = `SELECT * FROM listings JOIN users ON users.id = listings.user_id WHERE listings.id = '${productId}'`;
  pool.query(query).then((result) => {
    const date = result.rows.map((listing) => (moment(listing.created_at).from()));

    res.render('product', {
      productInfo: result.rows[0], nav, userName, date, productId,
    });
  }).catch((err) => {
    console.log(err.stack);
  });
}

app.get('/request-item/:productInfo', handleItemRequest);
app.get('/dashboard', renderUserDashboard);
app.get('/dashboard/:type', renderCustomDashboard);
app.get('/product/:id', renderProductInfo);

// post routes

app.post('/listing', multerUpload.single('productImageInfo'), handleListing);
app.post('/logout', handleLogOut);

// delete routes
app.delete('/delete/:item', handleDeleteReq);

bindRoutes(app);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
