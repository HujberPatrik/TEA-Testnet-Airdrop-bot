module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'SKIBIDI',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  JWT_ALGORITHM: 'HS256'
};