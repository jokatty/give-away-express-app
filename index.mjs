import express, { response } from 'express';
import ejs from 'ejs';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import axios from 'axios';
import methodOverride from 'method-override';
import bindRoutes from './routes/routes.mjs';

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));

bindRoutes(app);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
