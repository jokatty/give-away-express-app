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
