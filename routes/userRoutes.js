const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', authMiddleware, userController.getProfile);
router.post('/create-blog', authMiddleware, userController.createBlog);
router.put('/update-blog/:blogId', authMiddleware, userController.updateBlog);
router.delete('/delete-blog/:blogId', authMiddleware, userController.deleteBlog);
router.post('/like-blog/:blogId', authMiddleware, userController.likeBlog);
router.post('/comment-blog/:blogId', authMiddleware, userController.commentBlog);

module.exports = router;
