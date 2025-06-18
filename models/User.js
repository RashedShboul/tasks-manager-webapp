const { DataTypes } = require('sequelize'); 
const sequelize = require('../config/db'); 

const User = sequelize.define('users', {
    id: {
        type: DataTypes.UUID, 
        defaultValue: DataTypes.UUIDV4, 
        primaryKey: true
    }, 
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: [2, 100],
            notEmpty: true
        }
    }, 
    email: {
        type: DataTypes.STRING(255), 
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    }, 
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 255],
            notEmpty: true
        }
    },
    dateOfBirth: {
        type: DataTypes.DATE, 
        allowNull: false,
        validate: {
            isDate: true,
            isPast(value) {
                if (new Date(value) >= new Date()) {
                    throw new Error('Date of birth must be in the past');
                }
            }
        }
    }
}, {
    timestamps: true,

});


module.exports = User;