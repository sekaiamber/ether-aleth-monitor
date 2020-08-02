const Sequelize = require('sequelize');
const models = require('./model');

const {
  DB_HOST, DB_NAME, DB_USER, DB_PASS,
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: 'mariadb',
  dialectOptions: {
    timezone: 'Etc/GMT0',
  },
  logging: false,
});

const Models = models(sequelize);

function commonErrorHandler(req, res, next, err) {
  console.log(err);
  res.json_error = err.errors ? err.errors[0].message : 'database error';
  next();
}

module.exports.db = sequelize;
module.exports.Models = Models;
module.exports.commonErrorHandler = commonErrorHandler;
