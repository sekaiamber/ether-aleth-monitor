const express = require('express');
const jwt = require('jwt-simple');
const { Models, commonErrorHandler } = require('../db');
const jwtParser = require('../middlewares/jwtParser');
const argsCheck = require('../middlewares/argsCheck');
const ERROR = require('../const/ERROR.json');

const router = express.Router();
const { Account, Address } = Models;


router.get('/account/:t.json', (req, res, next) => {
  const { t } = req.params;
  const decodeT = Address.decodeMaskedKey(t);
  Account.findAll({ where: { t: decodeT } }).then((list) => {
    const ret = list.map((acc) => acc.getData());
    if (ret.length === 0) {
      ret.push({
        code: 'DIO',
        balance: 0,
      });
    }
    res.json_data = ret;
    next();
  });
});

module.exports = router;
