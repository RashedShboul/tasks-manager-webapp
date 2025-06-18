const Task = require('./Task');
const User = require('./User'); 

User.hasMany(Task, {
    foreignKey: 'userId', 
    as: 'tasks'
}); 

Task.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

module.exports = { User, Task };