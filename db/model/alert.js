/* eslint-disable no-underscore-dangle */
/* eslint-disable no-bitwise */
/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
const Sequelize = require('sequelize');
const fetch = require('../../utils/fetch');

const { Model, Op } = Sequelize;

const { ALETH_KEY, ALETH_URL } = process.env;

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
    return Promise.resolve(this);
    const { address, webhookId } = this;
    if (webhookId) return Promise.resolve(this);
    fetch.post(`${ALETH_URL}/v1/webhooks`, {
      data: {
        type: 'Webhook',
        attributes: {
          source: 'api',
          target: 'https://example.com/webhook-handler',
          config: {
            endpoint: 'https://api.aleth.io/v1/log-entries',
            filters: {
              name: 'value',
            },
            confirmations: 1,
          },
        },
      },
    }, {
      headers: {
        Authorization: `Bearer ${ALETH_KEY}`,
      },
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
