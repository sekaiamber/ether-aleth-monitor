const colors = require('colors');

function log(tag, msg) {
  if (tag && !msg) {
    console.log(colors.bgGreen('LOG'), tag);
  } else {
    console.log(colors.bgGreen(tag.toUpperCase()), msg);
  }
}

module.exports = log;
