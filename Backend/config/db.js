const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool(config);

module.exports = pool;