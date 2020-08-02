const ERROR = require('../const/ERROR.json');

function argsCheck(...args) {
  return function wrapper(req, res, next) {
    const { method } = req;
    let target;
    if (method.toUpperCase() === 'GET') {
      target = { ...req.query };
    } else {
      target = { ...req.body };
    }
    let result = true;
    args.forEach((arg) => {
      const val = target[arg];
      let varResult = true;
      if (!val) varResult = false;
      if (val && val.length === 0) varResult = false;
      result = result && varResult;
    });
    if (result) {
      next();
    } else {
      const ret = {
        success: false,
        error: {
          code: ERROR.ARGS_NEEDED.code,
          message: ERROR.ARGS_NEEDED.message,
        },
      };
      res.send(ret);
    }
  };
}

module.exports = argsCheck;
