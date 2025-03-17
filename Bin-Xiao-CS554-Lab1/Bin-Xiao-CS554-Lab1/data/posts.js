
import { ObjectId } from 'mongodb';
import * as mongoCollection from '../config/mongoCollections.js';
import helpers from '../helpers.js';
import { Cookie } from 'express-session';

const postsCollection = await mongoCollection.posts();
// query page
export async function getPostsByPage(page = 1) {
    if (typeof page !== 'number' || page < 1 || !Number.isInteger(page)) {
        throw new Error('Invalid page number.');
    }

    const skip = (page - 1) * 50;
    const limit = 50;

    const posts = await postsCollection
        .find({})
        .skip(skip)
        .limit(limit)
        .toArray();

    if (!posts || posts.length === 0) {

        return [];
    }


    return posts.map((p) => ({
        ...p,
        _id: p._id.toString(),
    }));
}

// query post
export async function getPostById(postId) {
    // 1. validation
    if (!postId || typeof postId !== 'string' || !ObjectId.isValid(postId)) {
        throw new Error('Invalid post ID.');
    }
    // 2. query db
    const objId = new ObjectId(postId);

    const post = await postsCollection.findOne({ _id: objId });
    if (!post) {
        throw new Error('Post not found.');
    }

    post._id = post._id.toString();
    // 3. return result
    return post;
}


export async function createPost(user, postText, postMood) {
    // pre check
    const validPostText = helpers.checkPostText(postText);
    const validPostMood = helpers.checkPostMood(postMood);
    const createTime = helpers.formatDateTime()
    // encapsulate new post
    const newPost = {
        postText: validPostText,
        postMood: validPostMood,
        postDateTime: createTime,
        userThatPosted: {
            _id: new ObjectId(user._id),
            username: user.username,
        },
        replies: [],
        likes: [],
    };
    //insert new post to db
    const insertInfo = await postsCollection.insertOne(newPost);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        throw new Error('Could not create post.');
    }
    //return new post
    newPost._id = insertInfo.insertedId.toString();
    return newPost;
}

//update post
export async function updatePost(user, postId, postText, postMood) {
    //1. validation
    if (!postId || typeof postId !== 'string' || !ObjectId.isValid(postId)) {
        throw new Error('Invalid post ID.');
    }
    const objId = new ObjectId(postId);

    const oldPost = await postsCollection.findOne({ _id: objId });
    if (!oldPost) {
        throw new Error('Post not found.');
    }

    // check if user is the author
    if (oldPost.userThatPosted._id.toString() !== user._id) {
        throw new Error('You do not have permission to edit this post.');
    }


    // 2. encapsulate updateData
    const updateData = {};

    if (postText !== undefined) {
        updateData.postText = helpers.checkPostText(postText);
    }
    if (postMood !== undefined) {
        updateData.postMood = helpers.checkPostMood(postMood);
    }

    updateData.postDateTime = helpers.formatDateTime();


    // 3.update post
    const updateInfo = await postsCollection.updateOne(
        { _id: objId },
        { $set: updateData }
    );
    if (updateInfo.modifiedCount === 0) {
        throw new Error('No changes were made to the post.');
    }

    // 4.return updated result
    const updatedPost = await postsCollection.findOne({ _id: objId });
    updatedPost._id = updatedPost._id.toString();
    return updatedPost;
}

// delete post by id
export async function removePost(user, postId) {
    if (!postId || typeof postId !== 'string' || !ObjectId.isValid(postId)) {
        throw new Error('Invalid post ID.');
    }
    const objId = new ObjectId(postId);

    const post = await postsCollection.findOne({ _id: objId });
    if (!post) {
        throw new Error('Post not found.');
    }
    // 判断用户权限
    if (post.userThatPosted._id.toString() !== user._id) {
        throw new Error('You do not have permission to delete this post.');
    }

    const deleteInfo = await postsCollection.deleteOne({ _id: objId });
    if (deleteInfo.deletedCount === 0) {
        throw new Error('Could not delete post.');
    }
    return true;
}

// add reply
export async function addReply(user, postId, replyText) {
    // 1. validation
    if (!postId || !ObjectId.isValid(postId)) {
        throw new Error('Invalid post ID.');
    }

    const post = await getPostById(postId);

    const validReply = helpers.checkReply(replyText);


    // 2. encapsulate replyObj
    const replyObj = {
        _id: new ObjectId(),
        userThatPostedReply: {
            _id: new ObjectId(user._id),
            username: user.username,
        },
        reply: validReply,
        replyDateTime: helpers.formatDateTime(),
    };


    // 3. update post to insert replyObj
    const updateInfo = await postsCollection.updateOne(
        { _id: new ObjectId(postId) },
        { $push: { replies: replyObj } }
    );
    if (updateInfo.modifiedCount === 0) {
        throw new Error('Could not add reply.');
    }


    // 4. return replyObj
    return replyObj;
}

// remove reply
export async function removeReply(user, postId, replyId) {
    // 1. validation
    if (!postId || !ObjectId.isValid(postId)) {
        throw new Error('Invalid post ID.');
    }
    if (!replyId || !ObjectId.isValid(replyId)) {
        throw new Error('Invalid reply ID.');
    }

    const post = await getPostById(postId);
    const replyToDelete = post.replies.find(r => r._id.toString() === replyId);
    if (!replyToDelete) {
        throw new Error('Reply not found.');
    }
    // check if user is the author
    if (replyToDelete.userThatPostedReply._id.toString() !== user._id) {
        throw new Error('You cannot delete another user\'s reply.');
    }
    // 2. update post to remove replyObj
    const updateInfo = await postsCollection.updateOne(
        { _id: new ObjectId(postId) },
        { $pull: { replies: { _id: new ObjectId(replyId) } } }
    );
    if (updateInfo.modifiedCount === 0) {
        throw new Error('Could not remove reply.');
    }
    return true;
}

// toggle like
export async function toggleLike(user, postId) {
    // 1. validation
    if (!postId || !ObjectId.isValid(postId)) {
        throw new Error('Invalid post ID.');
    }

    const post = await getPostById(postId);

    const userIdStr = user._id.toString();
    // 2. check if user already liked
    const alreadyLiked = post.likes.some((u) => u.toString() === userIdStr);

    let update;
    // 3. update post to toggle like
    if (alreadyLiked) {
        // cancle like
        update = await postsCollection.updateOne(
            { _id: new ObjectId(postId) },
            { $pull: { likes: userIdStr } }
        );
        if (update.modifiedCount === 0) {
            throw new Error('Could not remove like.');
        }
        return 'Like removed.';
    } else {
        // add like
        update = await postsCollection.updateOne(
            { _id: new ObjectId(postId) },
            { $push: { likes: userIdStr } }
        );
        if (update.modifiedCount === 0) {
            throw new Error('Could not add like.');
        }
        return 'Like added.';
    }
}
