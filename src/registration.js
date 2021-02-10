import express from 'express';
import pkg from 'express-validator';
import { select, insert } from './db.js';

const { body, validationResult } = pkg;

export const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

/**
 * Hjálparfall sem XSS hreinsar reit í formi eftir heiti.
 *
 * @param {string} fieldName Heiti á reit
 * @returns {function} Middleware sem hreinsar reit ef hann finnst
 */

const validations = [
  body('nafn')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),

  body('kt')
    .isLength({ min: 1 })
    .withMessage('Kennitala má ekki vera tóm'),

  body('kt')
    .matches(/^[0-9]{6}( |-)?[0-9]{4}$/)
    .withMessage('Kennitala verður að vera 10 tölustafir á forminu 0000000000 eða 000000-0000'),

  body('ath')
    .isLength({ max: 400 })
    .withMessage('Athugasemdirnar mega vera að mesta lagi 400 stafir'),
];

async function birtaError(req, res, next) {
  const {
    nafn = '',
    kt = '',
    ath = '',
  } = req.body;

  const data = {
    nafn,
    kt,
    ath,
  };

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const list = await select();
    const errorMessages = errors.array().map((i) => i.msg);
    return res.render('index', { data, list, errorMessages });
  }
  return next();
}

const sanitizations = [
  body('nafn').trim().escape(),
  body('kt').blacklist('-'),
  body('ath').trim().escape(),
];

// TODO skráningar virkni

async function undirskrift(req, res) {
  const data = {
    nafn: '',
    kt: '',
    ath: '',
  };

  const list = await select();
  const errorMessages = [];

  res.render('index', { list, data, errorMessages });
}

async function lesaInUndirskrift(req, res) {
  const inntak = req.body;

  insert(inntak);

  res.redirect('/');
}

router.get('/', catchErrors(undirskrift));
router.post('/', validations, birtaError, sanitizations, catchErrors(lesaInUndirskrift));
