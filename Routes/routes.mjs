import db from '../db/models/index.mjs';
import initIndexController from '../controller/index.mjs';
import initUserRegistration from '../controller/register.mjs';
import initLoginController from '../controller/login.mjs';
import initListingController from '../controller/listing.mjs';

export default function routes(app) {
  const indexController = initIndexController();
  const userRegistrationController = initUserRegistration(db);
  const loginController = initLoginController(db);
  const listingController = initListingController(db);

  app.get('/', indexController.index);
  app.get('/register', (req, res) => {
    res.render('register');
  });
  app.get('/login', (req, res) => {
    res.render('login');
  });
  app.post('/register', userRegistrationController.createUser);
  app.post('/login', loginController.handleLogin);
  // routes related to listing
  app.get('/listing', listingController.allowListing);
  app.get('/listing/:category', listingController.displayCategoryPage);
}
