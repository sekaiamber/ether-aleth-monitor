const { Models } = require('../db');

const { Var } = Models;

function varsProvider(...args) {
  return (req, res, next) => {
    Var.getVars(...args).then((vars) => {
      req.vars = vars;
      next();
    });
  };
}

module.exports = varsProvider;
