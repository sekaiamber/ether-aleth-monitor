/* eslint-disable no-param-reassign */
const jwt = require('jwt-simple');
const AccessControl = require('accesscontrol');
const { Models, commonErrorHandler } = require('../db');
const { getClentIp } = require('../utils');

const { Admin, AdminLog } = Models;

// 权限
const adminPermission = {
  user: {
    'create:any': ['*'],
    'read:any': ['*'],
    'update:any': ['*'],
    'delete:any': ['*'],
  },
  deposit: {
    'create:any': ['*'],
    'read:any': ['*'],
    'update:any': ['*'],
    'delete:any': ['*'],
  },
  withdraw: {
    'create:any': ['*'],
    'read:any': ['*'],
    'update:any': ['*'],
    'delete:any': ['*'],
  },
  settlement: {
    'create:any': ['*'],
    'read:any': ['*'],
    'update:any': ['*'],
    'delete:any': ['*'],
  },
  announcement: {
    'create:any': ['*'],
    'read:any': ['*'],
    'update:any': ['*'],
    'delete:any': ['*'],
  },
};

const grantsObject = {
  admin: adminPermission,
  super: {
    ...adminPermission,
    var: {
      'create:any': ['*'],
      'read:any': ['*'],
      'update:any': ['*'],
      'delete:any': ['*'],
    },
  },
};
const ac = new AccessControl(grantsObject);

function parser(req, res) {
  const token = req.get('x-access-token');

  return new Promise((resolve) => {
    if (!token || token.length < 10) {
      res.status(401).end('Access token needed');
      resolve(null);
      return;
    }
    // 解析
    const { app } = req;
    try {
      const decoded = jwt.decode(token, app.get('jwtAdminTokenSecret'));
      // todo  handle token here
      if (decoded.exp <= Date.now()) {
        res.status(401).end('Access token has expired');
        resolve(null);
        return;
      }
      Admin.findByPk(decoded.iss).then((user) => {
        if (!user) {
          res.status(401).end('Access token user not exsit');
          resolve(null);
          return;
        }
        const can = ac.can(user.type);
        user.can = can;
        resolve({
          jwt_data: decoded,
          jwt_user: user,
        });
      }).catch(() => {
        res.status(401).end('Find access token user failde');
        resolve(null);
      });
    } catch (err) {
      res.status(401).end('Access token parse failed');
      resolve(null);
    }
  });
}

function jwtParser(req, res, next) {
  parser(req, res).then((data) => {
    if (data) {
      req.jwt_data = data.jwt_data;
      req.jwt_user = data.jwt_user;
      next();
    }
  });
}


const actionMap = {
  create: 'createAny',
  read: 'readAny',
  update: 'updateAny',
  delete: 'deleteAny',
};
// {
//   user: ['create', 'read', 'update']
// }
function can(todo = {}) {
  function wrapper(req, res, next) {
    parser(req, res).then((data) => {
      if (data) {
        const { jwt_data, jwt_user } = data;
        req.jwt_data = jwt_data;
        req.jwt_user = jwt_user;
        let success = true;
        Object.keys(todo).forEach((resource) => {
          const actions = todo[resource];
          actions.forEach((action) => {
            const permission = jwt_user.can[actionMap[action]](resource);
            success = success && permission.granted;
          });
        });

        if (success) {
          next();
        } else {
          res.status(401).end('Not allow to access the resource');
        }
      }
    });
  }
  return wrapper;
}

function log(action) {
  return function wrapper(req, res, next) {
    const { method, url } = req;
    const params = { ...req.params };
    const body = { ...req.body };
    const success = !res.json_error;
    delete params.password;
    delete body.password;

    const payload = {
      action,
      method,
      url,
      params: JSON.stringify(params),
      body: JSON.stringify(body),
      success,
      ip: getClentIp(req),
    };

    if (req.jwt_user) {
      payload.adminId = req.jwt_user.id;
    }

    AdminLog.create(payload);
    next();
  };
}

log.login = log('login');
log.update = log('update');
log.verify = log('verify');
log.delete = log('delete');
log.create = log('create');

module.exports = jwtParser;
module.exports.can = can;
module.exports.log = log;
