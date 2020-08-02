const jwt = require('jwt-simple');
const { Models, commonErrorHandler } = require('../db');

const { Address } = Models;

function jwtParser(req, res, next) {
  const token = req.get('x-access-token');

  if (!token || token.length < 10) {
    res.status(401).end('Access token needed');
    return;
  }
  // 解析
  const { app } = req;
  try {
    const decoded = jwt.decode(token, app.get('jwtTokenSecret'));
    // todo  handle token here
    if (decoded.exp <= Date.now()) {
      res.status(401).end('Access token has expired');
      return;
    }
    Address.findByPk(decoded.iss).then((address) => {
      if (!address) {
        res.status(401).end('Access token user not exsit');
        return;
      }
      req.jwt_data = decoded;
      req.jwt_address = address;
      next();
    }).catch(() => {
      res.status(401).end('Find access token user failde');
    });
  } catch (err) {
    res.status(401).end('Access token parse failed');
  }
}

function jsonpJwtParser(req, res, next) {
  const { token = '' } = req.query;
  const { app } = req;
  if (token === '') {
    req.jwt_address = null;
    next();
    return;
  }
  try {
    const decoded = jwt.decode(token, app.get('jwtTokenSecret'));
    // todo  handle token here
    if (decoded.exp <= Date.now()) {
      req.jwt_address = null;
      next();
      return;
    }
    Address.findByPk(decoded.iss).then((address) => {
      if (!address) {
        req.jwt_address = null;
        next();
        return;
      }
      req.jwt_address = address;
      next();
    }).catch(() => {
      req.jwt_address = null;
      next();
    });
  } catch (err) {
    req.jwt_address = null;
    next();
  }
}

module.exports = jwtParser;
module.exports.jsonp = jsonpJwtParser;
