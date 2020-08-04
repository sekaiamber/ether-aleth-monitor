const express = require('express');
const jwt = require('jwt-simple');
const { Models, commonErrorHandler } = require('../db');
const jwtParser = require('../middlewares/jwtParser');
const argsCheck = require('../middlewares/argsCheck');
const ERROR = require('../const/ERROR.json');

const router = express.Router();
const { Alert, Callback } = Models;

router.post('/alert/new.json', argsCheck('address', 'type'), (req, res, next) => {
  const { address, type } = req.body;
  Alert.findOrCreate({
    where: {
      address: address.toLowerCase(),
      type,
    },
    defaults: {
      address: address.toLowerCase(),
      type,
    },
  }).then(([alert]) => {
    res.json_data = alert.getData();
    if (!alert.monitored) {
      alert.setMonitor();
    }
    next();
  });
});

router.post('/callback', (req, res) => {
  // const { alertId } = req.params;
  // Alert.findByPk(alertId).then((alert) => {
  //   if (!alert) {
  //     res.status(404).end('Not found alert');
  //   } else {
  //     Callback.create({
  //       alertId,
  //       raw: JSON.stringify(req.body),
  //       parsed: '1',
  //     }).then((callback) => {
  //       if (callback) {
  //         res.status(200);
  //         res.end('success');
  //       } else {
  //         res.status(500);
  //         res.end('create fail');
  //       }
  //     });
  //   }
  // });
  Callback.add(req.body).then((callback) => {

    res.status(200);
    res.end('success');
  });
});

module.exports = router;
