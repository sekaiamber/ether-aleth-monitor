const express = require('express');
const Wallet = require('ethereumjs-wallet');
const mnemonic = require('mnemonic');
const jwt = require('jwt-simple');
const { Models, commonErrorHandler } = require('../db');
const jwtParser = require('../middlewares/jwtParser');
const argsCheck = require('../middlewares/argsCheck');
const ERROR = require('../const/ERROR.json');
const { getClentIp } = require('../utils');

const router = express.Router();

router.post('/address.json', (req, res, next) => {
  const wallet = Wallet.generate();
  const publicKey = wallet.getPublicKeyString();
  const privateKey = wallet.getPrivateKeyString();
  const address = wallet.getAddressString();
  const mnemonicWords = mnemonic.encode(privateKey.slice(2));
  const ret = {
    publicKey,
    privateKey,
    address,
    mnemonicWords,
  };
  res.json_data = ret;
  next();
});

module.exports = router;
