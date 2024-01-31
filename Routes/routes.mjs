import db from '../db/models/index.mjs';
import initIndexController from '../controller/index.mjs';

export default function routes(app) {
  const indexController = initIndexController();
  app.get('/', indexController.index);
}
