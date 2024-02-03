import express, { response } from 'express';
import ejs from 'ejs';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import axios from 'axios';

import methodOverride from 'method-override';
import moment from 'moment';
import bindRoutes from './routes/routes.mjs';

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));

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

app.get('/dashboard/:type', renderCustomDashboard);
app.get('/product/:id', renderProductInfo);

// post routes

app.post('/logout', handleLogOut);

// delete routes
app.delete('/delete/:item', handleDeleteReq);

bindRoutes(app);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
