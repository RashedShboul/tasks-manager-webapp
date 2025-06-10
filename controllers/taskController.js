const Task = require('../models/Task'); 
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.findAll(); 
        res.json(tasks);
        
    } catch(err) {
        res.status(500).json({error: 'failed to fetch tasks'}); 
    }
}

exports.getTaskById = async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await Task.findByPk(taskId);
        
        if (!task) {
            return res.status(404).json({ 
                error: 'Task not found',
                message: `No task found with id: ${taskId}`
            });
        }

        res.json(task);
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ 
            error: 'Failed to fetch task',
            message: error.message 
        });
    }
};

exports.addTask = async (req, res) => {
    try {
        const { title, description, status, priority, dueDate } = req.body;

        // Validate required fields
        if (!title) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Title is required'
            });
        }

        // Validate status if provided
        if (status && !['pending', 'in_progress', 'completed'].includes(status)) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Status must be one of: pending, in_progress, completed'
            });
        }

        // Validate priority if provided
        if (priority && !['low', 'medium', 'high'].includes(priority)) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Priority must be one of: low, medium, high'
            });
        }

        // Validate dueDate only if it's provided (it's optional)
        if (dueDate !== undefined && dueDate !== null) {
            if (isNaN(new Date(dueDate).getTime())) {
                return res.status(400).json({
                    error: 'Validation Error',
                    message: 'Invalid due date format. If provided, must be a valid date'
                });
            }
        }

        const addedTask = await Task.create({
            title,
            description,
            status,
            priority,
            dueDate: dueDate ? new Date(dueDate) : null  // dueDate remains optional
        });

        res.status(201).json({
            message: 'Task created successfully',
            task: addedTask
        });

    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
            error: 'Failed to create task',
            message: error.message
        });
    }
};

exports.updateTask = async (req, res) => {
    const { id } = req.params; 
    const updates = req.body; 
    console.log(id); 
    console.log(updates); 
    try {
        const task = await Task.findByPk(id); 
        if (!task) {
            return res.status(404).json({ 
                error: 'Task not found',
                message: `No task found with id: ${id}`
            });
        }
        console.log(task); 
        await task.update(updates); 
        res.json(task); 
    } catch(error) {
        res.status(500).json({ message: 'Failed to update task', error: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    const { id } = req.params; 
    try {
        // First check if the task exists
        const task = await Task.findByPk(id);
        
        if (!task) {
            return res.status(404).json({ 
                error: 'Task not found',
                message: `No task found with id: ${id}`
            });
        }

        // Delete the task
        const deletedTask = await Task.destroy({
            where: {
                id: id
            }
        });

        if (deletedTask) {
            res.json({
                message: 'Task deleted successfully',
                deletedTask: task
            });
        } else {
            res.status(500).json({
                error: 'Failed to delete task',
                message: 'Task could not be deleted'
            });
        }
    } catch(error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            error: 'Failed to delete task',
            message: error.message
        });
    }
};