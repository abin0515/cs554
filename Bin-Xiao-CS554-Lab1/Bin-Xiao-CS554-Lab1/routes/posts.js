
import { Router } from 'express';

import * as postsData from '../data/posts.js';
import middleware from '../middleware.js';

const router = Router();
// add new post
router.post('/', middleware.isAuthenticated, async (req, res) => {
    try {
        const { postText, postMood } = req.body;
        if (!postText || !postMood) {
            throw new Error('You must provide postText and postMood.');
        }

        const newPost = await postsData.createPost(req.session.user, postText, postMood);
        return res.status(200).json(newPost);
    } catch (e) {
        return res.status(400).json({ error: e.message });
    }
});

// delete post
router.delete('/:id', middleware.isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await postsData.removePost(req.session.user, id);
        if (deleted) {
            return res.status(200).json({ message: "Successfully deleted post." });
        }
    } catch (e) {
        if (e.message === 'Post not found.') {
            return res.status(404).json({ error: e.message });
        }
        if (e.message === 'You do not have permission to delete this post.') {
            return res.status(403).json({ error: e.message });
        }
        return res.status(400).json({ error: e.message });
    }
});

//update post
router.patch('/:id', middleware.isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { postText, postMood } = req.body;


        if (postText === undefined && postMood === undefined) {
            throw new Error('No fields to update.');
        }

        const updated = await postsData.updatePost(req.session.user, id, postText, postMood);
        return res.status(200).json(updated);
    } catch (e) {
        if (e.message === 'Post not found.') {
            return res.status(404).json({ error: e.message });
        }
        if (e.message === 'You do not have permission to edit this post.') {
            return res.status(403).json({ error: e.message });
        }
        return res.status(400).json({ error: e.message });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const post = await postsData.getPostById(id);
        return res.status(200).json(post);
    } catch (e) {
        if (e.message === 'Post not found.') {
            return res.status(404).json({ error: e.message });
        }
        return res.status(400).json({ error: e.message });
    }
});


// add reply
router.post('/:id/replies', middleware.isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;
        if (!reply) {
            throw new Error('You must provide a reply text.');
        }

        const replyObj = await postsData.addReply(req.session.user, id, reply);
        return res.status(200).json(replyObj);
    } catch (e) {
        if (e.message === 'Post not found.') {
            return res.status(404).json({ error: e.message });
        }
        return res.status(400).json({ error: e.message });
    }
});

// delete reply
router.delete('/:postId/:replyId', middleware.isAuthenticated, async (req, res) => {
    try {
        const { postId, replyId } = req.params;
        const result = await postsData.removeReply(req.session.user, postId, replyId);
        if (result) {
            return res.status(200).json({ message: "Successfully deleted reply." });
        }
    } catch (e) {
        if (e.message === 'Post not found.' || e.message === 'Reply not found.') {
            return res.status(404).json({ error: e.message });
        }
        if (e.message === 'You cannot delete the reply not belong to you.') {
            return res.status(403).json({ error: e.message });
        }
        return res.status(400).json({ error: e.message });
    }
});

// add or delete likes
router.post('/:id/likes', middleware.isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const message = await postsData.toggleLike(req.session.user, id);
        return res.status(200).json({ message });
    } catch (e) {
        if (e.message === 'Post not found.') {
            return res.status(404).json({ error: e.message });
        }
        return res.status(400).json({ error: e.message });
    }
});

export default router;
