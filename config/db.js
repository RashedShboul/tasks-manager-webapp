const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('Creating Sequelize instance...');
const sequelize = new Sequelize('tasks_db', 'postgres', '', {
    host: 'localhost',
    dialect: 'postgres'
});
console.log('Sequelize instance created');


module.exports = sequelize;