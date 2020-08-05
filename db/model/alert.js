/* eslint-disable no-underscore-dangle */
/* eslint-disable no-bitwise */
/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
const Sequelize = require('sequelize');
const fetch = require('../../utils/fetch');

const { Model, Op } = Sequelize;
const { BN_KEY, BN_URL, BN_NETWORK } = process.env;

class Alert extends Model {
  getData() {
    const ret = {
      address: this.address,
      type: this.type,
      monitored: this.monitored,
    };
    return ret;
  }

  setMonitor() {
    // return Promise.resolve(this);
    const { address, webhookId } = this;
    if (webhookId) return Promise.resolve(this);
    return fetch.post(BN_URL, {
      apiKey: BN_KEY,
      address,
      blockchain: 'ethereum',
      networks: [BN_NETWORK],
    }).then((resp) => {
      if (resp.msg === 'success') {
        this.monitored = true;
        return this.save();
      }
      return this;
    });
  }
}

function model(sequelize) {
  Alert.init({
    // 地址
    address: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    type: {
      type: Sequelize.ENUM('tx'),
      allowNull: false,
    },
    monitored: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    webhookId: {
      type: Sequelize.STRING,
    },
  }, {
    indexes: [{
      fields: ['address', 'type'],
      unique: true,
    }],
    sequelize,
    modelName: 'alert',
  });
  return Alert;
}

module.exports = model;
