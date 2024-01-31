import db from '../db/models/index.mjs';
import initIndexController from '../controller/index.mjs';
import initUserRegistration from '../controller/register.mjs';

export default function routes(app) {
  const indexController = initIndexController();
  const userRegistrationController = initUserRegistration(db);
  app.get('/', indexController.index);
  app.get('/register', (req, res) => {
    res.render('register');
  });
  app.get('/login', (req, res) => {
    res.render('login');
  });
  app.post('/register', userRegistrationController.createUser);
}
