import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { router as registrationRouter } from './registration.js';

dotenv.config();
const app = express();

const path = dirname(fileURLToPath(import.meta.url));
app.use(express.static(join(path, '../public')));
app.set('views', join(path, '../views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const {
  PORT: port = 3000,
} = process.env;

// TODO setja upp rest af virkni!
function isInvalid(field, errors) {
  return Boolean(errors.find((i) => i.param === field));
}

app.locals.isInvalid = isInvalid;

app.use('/', registrationRouter);

function notFoundHandler(req, res, next) { // eslint-disable-line
  const title = 'Fannst ekki :(';
  const message = 'efnið finnst ekki!';
  res.status(404).render('error', { title, message });
}

function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error(err); // eslint-disable-line
  const title = 'Villa kom upp';
  const message = '';
  res.status(500).render('error', { title, message });
}
// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
