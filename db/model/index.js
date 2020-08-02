const thevar = require('./var');
const alert = require('./alert');
const callback = require('./callback');

const Models = {};

function model(sequelize) {
  Models.Var = thevar(sequelize);
  Models.Alert = alert(sequelize);
  Models.Callback = callback(sequelize);

  // 关系
  Models.Alert.hasMany(Models.Callback, { foreignKey: 'alertId', sourceKey: 'id', as: 'callbacks' });
  Models.Callback.belongsTo(Models.Alert, { foreignKey: 'alertId', targetKey: 'id', as: 'alert' });

  return Models;
}

module.exports = model;
