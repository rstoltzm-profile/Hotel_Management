var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : '<REMOVE>',
  password        : '<REMOVE>',
  database        : '<REMOVE>',
  dateStrings: true
});
module.exports.pool = pool;

