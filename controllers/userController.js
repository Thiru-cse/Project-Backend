// Implement the user controller methods
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Blog = require('../models/Blog');

// Register a new user
const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create a new user
        user = new User({ username, email, password });

        // Save the user to the database
        await user.save();

        // Create JWT token
        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.SECRET_KEY,
            { expiresIn: 3600 }, // 1 hour expiration
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Login user
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Compare entered password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Create JWT token
        const payload = {
            user: {
                id: user.id,
                role: user.role,
            },
        };

        jwt.sign(
            payload,
            process.env.SECRET_KEY,
            { expiresIn: 3600 }, // 1 hour expiration
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        // Find user by ID and exclude the password field
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Create a new blog
const createBlog = async (req, res) => {
    const { title, content, image } = req.body;

    try {
        // Find the logged-in user
        const user = await User.findById(req.user.id).select('-password');

        // Create a new blog
        const newBlog = new Blog({
            title,
            content,
            image,
            userId: user.id,
        });

        // Save the blog to the database
        await newBlog.save();

        res.json(newBlog);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Update a blog
const updateBlog = async (req, res) => {
    const { title, content, image } = req.body;

    try {
        // Find the blog by ID
        let blog = await Blog.findById(req.params.blogId);

        // Check if the blog exists
        if (!blog) {
            return res.status(404).json({ msg: 'Blog not found' });
        }

        // Check if the user owns the blog
        if (blog.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Update the blog
        blog.title = title;
        blog.content = content;
        blog.image = image;

        // Save the updated blog to the database
        await blog.save();

        res.json(blog);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Delete a blog
const deleteBlog = async (req, res) => {
    try {
        // Find the blog by ID
        let blog = await Blog.findById(req.params.blogId);

        // Check if the blog exists
        if (!blog) {
            return res.status(404).json({ msg: 'Blog not found' });
        }

        // Check if the user owns the blog
        if (blog.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Delete the blog
        await blog.deleteOne();

        res.json({ msg: 'Blog removed' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Like a blog
const likeBlog = async (req, res) => {
    try {
        // Find the blog by ID
        let blog = await Blog.findById(req.params.blogId);

        // Check if the blog exists
        if (!blog) {
            return res.status(404).json({ msg: 'Blog not found' });
        }

        // Check if the user has already liked the blog
        if (blog.likes.includes(req.user.id)) {
            return res.status(400).json({ msg: 'Blog already liked' });
        }

        // Add user ID to likes array
        blog.likes.push(req.user.id);

        // Save the updated blog to the database
        await blog.save();

        res.json(blog.likes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Comment on a blog
const commentBlog = async (req, res) => {
    const { text } = req.body;

    try {
        // Find the blog by ID
        let blog = await Blog.findById(req.params.blogId);

        // Check if the blog exists
        if (!blog) {
            return res.status(404).json({ msg: 'Blog not found' });
        }

        // Create a new comment object
        const newComment = {
            userId: req.user.id,
            text,
        };

        // Add the new comment to the comments array
        blog.comments.push(newComment);

        // Save the updated blog to the database
        await blog.save();

        res.json(blog.comments);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {register, login, getProfile, createBlog, updateBlog, deleteBlog, likeBlog, commentBlog};