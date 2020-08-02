/* eslint-disable no-bitwise */
/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
const Sequelize = require('sequelize');

const { Model, Op } = Sequelize;

class Var extends Model {
  static getVars(...args) {
    const vars = {};
    args.forEach((key) => {
      vars[key] = null;
    });
    return Var.findAll({ where: { tag: { [Op.in]: args } } }).then((rows) => {
      rows.forEach((row) => {
        let data = null;
        if (row.type === 'DECIMAL') data = row.dataDecimal;
        if (row.type === 'STRING') data = row.dataString;
        if (row.type === 'BOOLEAN') data = row.dataBoolean;
        vars[row.tag] = data;
      });
      return vars;
    });
  }

  static incrementTotalPoint(num, transaction) {
    return Var.findOne({ where: { tag: 'TOTAL_POINT' } }, { transaction })
      .then((_var) => _var.increment('dataDecimal', { by: num, transaction }));
  }

  getData() {
    const ret = {
      tag: this.tag,
      kind: this.kind,
      type: this.type,
      memo: this.memo,
      readOnly: this.readOnly,
    };
    switch (this.type) {
      case 'DECIMAL':
        ret.data = this.dataDecimal;
        break;
      case 'STRING':
        ret.data = this.dataString;
        break;
      case 'BOOLEAN':
        ret.data = this.dataBoolean;
        break;
      default:
        break;
    }
    return ret;
  }
}

function model(sequelize) {
  Var.init({
    tag: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    kind: {
      type: Sequelize.ENUM('parameter', 'information', 'ui'),
      allowNull: false,
      defaultValue: 'parameter',
    },
    type: {
      type: Sequelize.ENUM('DECIMAL', 'STRING', 'BOOLEAN'),
    },
    dataDecimal: {
      type: Sequelize.DECIMAL(32, 16),
    },
    dataString: {
      type: Sequelize.STRING,
    },
    dataBoolean: {
      type: Sequelize.BOOLEAN,
    },
    memo: {
      type: Sequelize.STRING,
    },
    readOnly: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'var',
  });
  return Var;
}

module.exports = model;
