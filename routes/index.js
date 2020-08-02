const express = require('express');
const Wallet = require('ethereumjs-wallet');
const EthUtils = require('ethereumjs-util');

// const { Models, commonErrorHandler } = require('../db');
// const varsProvider = require('../middlewares/varsProvider');
// const jwtParser = require('../middlewares/jwtParser');

// const { Announcement, Deposit } = Models;

const router = express.Router();

/* GET home page. */
router.get('/t.json', (req, res, next) => {
  const w = Wallet.fromPrivateKey(Buffer.from('0c3b39df83bd09600ad692c5000ed053ce4b3d5631a335a8267fc8cfa6a4e112', 'hex'));
  res.json_data = { pub: w.getPublicKeyString(), add: w.getAddressString() };
  next();
});

// router.get('/banners.json',
//   varsProvider('BANNER'),
//   (req, res, next) => {
//     const { vars } = req;
//     const { BANNER } = vars;
//     res.json_data = JSON.parse(BANNER);
//     next();
//   });

// router.get('/consts.json',
//   varsProvider(
//     'DEPOSIT_REWARD_RATE',
//     'DEPOSIT_REWARD_RATE_L1',
//     'DEPOSIT_REWARD_RATE_L2',
//     'DEPOSIT_REWARD_RATE_L3',
//     'GAME_REWARD_RATE',
//     'GAME_REWARD_RATE_L1',
//     'GAME_REWARD_RATE_L2',
//     'GAME_REWARD_RATE_L3',
//     'CONTACT_EMAIL',
//   ),
//   (req, res, next) => {
//     const { vars } = req;
//     res.json_data = vars;
//     next();
//   });

// router.post('/test.json',
//   jwtParser,
//   (req, res, next) => {
//     const { jwt_user } = req;
//     next();
//   });

module.exports = router;
