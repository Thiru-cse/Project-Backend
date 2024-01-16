const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);
router.get('/unapproved-blogs', adminController.getUnapprovedBlogs);
router.put('/approve-blog/:blogId', adminController.approveBlog);
router.delete('/delete-blog/:blogId', adminController.deleteBlog);

module.exports = router;
