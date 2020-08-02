const random = require('random');
const moment = require('moment');

function shuffle(a) {
  const ret = [...a];
  for (let i = ret.length - 1; i > 0; i -= 1) {
    const j = random.int(0, i);
    [ret[i], ret[j]] = [ret[j], ret[i]];
  }
  return ret;
}

function getClentIp(req) {
  const ip = req.headers['x-forwarded-for']
      || req.ip
      || req.connection.remoteAddress
      || req.socket.remoteAddress
      || req.connection.socket.remoteAddress || '';
  return ip;
}

function getOrderId(type, userId, createdAt = new Date()) {
  const t = moment(createdAt).format('YYMMDDHHmmssSSS');
  const u = (`00${userId}`).slice(-3);
  const r = (`00${random.int(0, 1000)}`).slice(-3);
  return `${type}${t}${u}${r}`;
}

function sedoRandom(seed, max = 1, min = 0) {
  const base = parseFloat(`0.${Math.sin(seed).toString().substr(6)}`);
  if (max === 1 && min === 0) {
    return base;
  }
  return base * (max - min) + min;
}

getOrderId.deposit = (userId, createdAt = new Date()) => getOrderId('100', userId, createdAt);
getOrderId.withdraw = (userId, createdAt = new Date()) => getOrderId('200', userId, createdAt);
getOrderId.game2 = (userId, createdAt = new Date()) => getOrderId('300', userId, createdAt);
getOrderId.lottery = {};
getOrderId.lottery.m3ssc = (userId, createdAt = new Date()) => getOrderId('310', userId, createdAt);
getOrderId.lottery.tjssc = (userId, createdAt = new Date()) => getOrderId('311', userId, createdAt);
getOrderId.balanceVersion = (balanceId, createdAt = new Date()) => getOrderId('400', balanceId, createdAt);

module.exports.shuffle = shuffle;
module.exports.getClentIp = getClentIp;
module.exports.getOrderId = getOrderId;
module.exports.sedoRandom = sedoRandom;
