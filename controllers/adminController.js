// Implement the admin controller methods
const Blog = require('../models/Blog');

// Get unapproved and reported blogs (only accessible by admins and moderators)
const getUnapprovedBlogs = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Unauthorized' });
        }

        const unapprovedBlogs = await Blog.find({ approved: false }).populate('userId', 'username');
        const reportedBlogs = await Blog.find({ reported: true }).populate('userId', 'username');

        res.json({ unapprovedBlogs, reportedBlogs });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Approve a blog (only accessible by admins)
const approveBlog = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Unauthorized' });
        }

        const blog = await Blog.findById(req.params.blogId);

        // Check if the blog exists
        if (!blog) {
            return res.status(404).json({ msg: 'Blog not found' });
        }

        // Approve the blog
        blog.approved = true;

        // Save the updated blog to the database
        await blog.save();

        res.json({ msg: 'Blog approved successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Delete a blog (only accessible by admins)
const deleteBlog = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Unauthorized' });
        }

        const blog = await Blog.findById(req.params.blogId);

        // Check if the blog exists
        if (!blog) {
            return res.status(404).json({ msg: 'Blog not found' });
        }

        // Delete the blog
        await blog.deleteOne();

        res.json({ msg: 'Blog deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};


module.exports = {deleteBlog, approveBlog, getUnapprovedBlogs}
