import multer from 'multer';
import db from '../db/models/index.mjs';
import initIndexController from '../controller/index.mjs';
import initUserRegistration from '../controller/register.mjs';
import initLoginController from '../controller/login.mjs';
import initListingController from '../controller/listing.mjs';
import initProductController from '../controller/product.mjs';
import initDashboardController from '../controller/dashboard.mjs';
import initLogoutController from '../controller/logout.mjs';
import initDeleteController from '../controller/deleteProduct.mjs';

const multerUpload = multer({ dest: 'uploads/' });

export default function routes(app) {
  const indexController = initIndexController();
  const userRegistrationController = initUserRegistration(db);
  const loginController = initLoginController(db);
  const listingController = initListingController(db);
  const productController = initProductController(db);
  const dashboardController = initDashboardController(db);
  const logoutController = initLogoutController();
  const deleteController = initDeleteController(db);

  app.get('/', indexController.index);
  app.get('/register', (req, res) => {
    res.render('register');
  });
  app.get('/login', (req, res) => {
    res.render('login');
  });
  app.post('/logout', logoutController.handleLogOut);
  app.post('/register', userRegistrationController.createUser);
  app.post('/login', loginController.handleLogin);
  // routes related to listing
  app.get('/listing', listingController.allowListing);
  app.get('/listing/:category', listingController.displayCategoryPage);
  app.post('/listing', multerUpload.single('productImageInfo'), listingController.createListing);
  // routes related to products - item request and product info
  app.get('/request-item/:productInfo', productController.requestProduct);
  app.get('/product/:id', productController.renderProductInfo);
  // dashboards
  app.get('/dashboard', dashboardController.renderUserDashboard);
  app.get('/dashboard/:type', dashboardController.renderCustomDashboard);
  // delete added or requested items.
  app.delete('/delete/:item', deleteController.handleDeleteReq);
}
