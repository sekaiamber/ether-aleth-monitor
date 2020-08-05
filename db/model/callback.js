/* eslint-disable no-underscore-dangle */
/* eslint-disable no-bitwise */
/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
const Sequelize = require('sequelize');
const fetch = require('../../utils/fetch');

const { Model, Op } = Sequelize;
const { WEBHOOK } = process.env;

function parseEth(feedback) {
  const { watchedAddress, system, network, status, hash, from, to, asset, value, direction, blockNumber } = feedback;
  const ret = {
    address: watchedAddress.toLowerCase(),
    system,
    network,
    status,
    hash: hash.toLowerCase(),
    from: from.toLowerCase(),
    to: to.toLowerCase(),
    blockNumber,
    asset,
    value,
    decimals: 18,
    direction,
  };
  return ret;
}

function parseErc20(feedback) {
  const { watchedAddress, system, network, status, hash, from, asset, direction, contractCall, blockNumber } = feedback;
  const { contractType, contractAddress, contractDecimals, methodName, params } = contractCall;
  if (methodName !== 'transfer') return null;
  const { _to, _value } = params;
  if (!_to || !_value) return null;
  const ret = {
    address: watchedAddress.toLowerCase(),
    system,
    network,
    status,
    hash: hash.toLowerCase(),
    from: from.toLowerCase(),
    to: _to.toLowerCase(),
    blockNumber,
    asset,
    value: _value,
    decimals: contractDecimals,
    direction,
    contractType,
    contractAddress,
  };
  return ret;
}

class Callback extends Model {
  static add(feedback) {
    let obj;
    const { asset, value, contractCall, watchedAddress } = feedback;
    const { sequelize } = Callback;
    const Alert = sequelize.model('alert');
    return Alert.findOne({
      where: {
        address: watchedAddress.toLowerCase(),
        type: 'tx',
      },
    }).then((alert) => {
      if (!alert) return null;
      // 判断是ETH还是ERC20
      if (asset === 'ETH' && value > 0 && !contractCall) {
        obj = parseEth(feedback);
      }
      if (asset !== 'ETH' && contractCall && contractCall.contractType === 'erc20') {
        obj = parseErc20(feedback);
      }
      if (!obj) return null;
      return Callback.create(obj);
    });
  }

  fireWebhook() {
    fetch.post(WEBHOOK, this.getData()).then((data) => {
      if (data.success) {
        this.webhookResponsed = true;
        this.save();
      }
    });
  }

  getData() {
    const ret = {
      address: this.address,
      system: this.system,
      network: this.network,
      status: this.status,
      hash: this.hash,
      from: this.from,
      to: this.to,
      asset: this.asset,
      value: this.value,
      decimals: this.decimals,
      direction: this.direction,
      blockNumber: this.blockNumber,
      contractAddress: this.contractAddress,
      contractType: this.contractType,
    };
    return ret;
  }
}

function model(sequelize) {
  Callback.init({
    // alert
    address: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    system: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    network: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM('pending', 'speedup', 'cancel', 'confirmed', 'failed', 'dropped'),
      allowNull: false,
    },
    hash: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    from: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    to: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    asset: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    value: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    decimals: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    direction: {
      type: Sequelize.ENUM('incoming', 'outgoing'),
    },
    blockNumber: {
      type: Sequelize.INTEGER,
    },
    // 合约数据
    contractAddress: {
      type: Sequelize.STRING,
    },
    contractType: {
      type: Sequelize.STRING,
    },
    // 回调
    webhookResponsed: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'callback',
  });
  return Callback;
}

module.exports = model;
