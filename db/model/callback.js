/* eslint-disable no-underscore-dangle */
/* eslint-disable no-bitwise */
/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
const Sequelize = require('sequelize');

const { Model, Op } = Sequelize;

class Callback extends Model {
  
}

function model(sequelize) {
  Callback.init({
    // alert
    alertId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    // 原始数据
    raw: {
      type: Sequelize.STRING(5000),
      allowNull: false,
    },
    // 分析后的数据
    parsed: {
      type: Sequelize.STRING(5000),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'callback',
  });
  return Callback;
}

module.exports = model;
