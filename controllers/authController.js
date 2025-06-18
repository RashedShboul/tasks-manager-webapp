const User = require('../models/User'); 
const bcrypt = require('bcrypt'); 
const express = require('express'); 
const validatePassword = require('../utils/validatePassword'); 

exports.registerUser = async (req, res) => {
    try {
        const {name, email, password, dateOfBirth} = req.body; 
        
        // Validate required fields
        if (!name || !email || !password || !dateOfBirth) {
            return res.status(400).json({ 
                error: 'Name, email, password, and date of birth are required'
            });
        }

        // Check if user exists
        const userExist = await User.findOne({ where: { email } }); 
        if (userExist) {
            return res.status(409).json({
                error: 'User with this email already exists'
            }); 
        }

        // Validate password
        const passwordErrors = await validatePassword(password); 
        if (passwordErrors) {
            return res.status(400).json({
                error: 'Password validation failed',
                details: passwordErrors
            });
        }

        // Hash password and create user
        const hashRounds = 12; 
        const hashedPassword = await bcrypt.hash(password, hashRounds); 
        
        const user = await User.create({
            name, 
            email, 
            password: hashedPassword, 
            dateOfBirth
        });

        // Prepare response without sensitive data
        const addedUser = {
            id: user.id,
            name: user.name, 
            email: user.email, 
            dateOfBirth: user.dateOfBirth,
            createdAt: user.createdAt
        };

        res.status(201).json({
            success: true,
            message: 'User created successfully', 
            user: addedUser
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Failed to create user',
            message: error.message
        }); 
    } 
};