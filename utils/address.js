const base32 = require('base32');

function hexToBase32(hexStr) {
  let hex;
  if (hexStr.startsWith('0x')) {
    hex = Buffer.from(hexStr.slice(2), 'hex');
  } else {
    hex = Buffer.from(hexStr);
  }
  return base32.encode(hex);
}

function base32ToHex(base32Str) {
  const bi = base32.decode(base32Str);
  return `0x${Buffer.from(bi, 'binary').toString('hex')}`;
}

module.exports.hexToBase32 = hexToBase32;
module.exports.base32ToHex = base32ToHex;
