const router = require('express').Router();
const { User, Post, Comment } = require('../../models');
const withAuth = require('../../utils/auth');



// display all comments for a specific post
// ------------------------------------

router.get('/:postId', withAuth, async (req, res) => {
  try {
    // Extract post ID from the request parameters
    const postId = req.params.postId;

    // Find all comments associated with the specified post ID
    const commentsForPost = await Comment.findAll({
      where: {
        post_id: postId
      }
    });

    // Check if comments were found
    if (commentsForPost.length === 0) {
      return res.status(404).json({ message: 'No comments found for this post' });
    }

    // Respond with the comments
    res.status(200).json(commentsForPost);

  } catch (err) {
    // Log and respond with error message
    console.error('Error occurred while fetching comments:', err.message);
    res.status(500).json({ message: 'Error occurred while fetching comments', error: err.message });
  }
});



// Add and Display all comments for a specific post
// ------------------------------------

router.post('/', withAuth, async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.comment) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    // Assuming post_id is provided in the request body
    const postId = req.body.post_id;
    if (!postId) {
      return res.status(400).json({ message: 'Post ID is required' });
    }

    // Add the comment
    const addComment = await Comment.create({
      comment: req.body.comment,
      user_id: req.session.user_id,
      post_id: postId
    });

    // Fetch all comments for the specific post, excluding the current user's own comment
    const commentsForPost = await Comment.findAll({
      where: {
        post_id: postId,
        user_id: { [Op.ne]: req.session.user_id } // Exclude comments from the current user
      },
      include: {
        model: User,
        attributes: ['name']
      }
    });

    // Respond with all comments for the post, excluding the current user's comment
    res.status(200).json(commentsForPost);

  } catch (err) {
    // Log and respond with error message
    console.error('Error occurred while creating or retrieving comments:', err.message);
    res.status(500).json({ message: 'Error occurred while creating or retrieving comments', error: err.message });
  }
});





// Update comment
// --------------

router.put('/:commentId', withAuth, async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const { comment } = req.body;

    // Validate required fields
    if (!comment) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    // Find the comment to update
    const existingComment = await Comment.findByPk(commentId);
    if (!existingComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the current user is the author of the comment
    if (existingComment.user_id !== req.session.user_id) {
      return res.status(403).json({ message: 'You are not authorized to update this comment' });
    }

    // Update the comment
    existingComment.comment = comment;
    await existingComment.save();

    // Respond with the updated comment
    res.status(200).json(existingComment);

  } catch (err) {
    // Log and respond with error message
    console.error('Error occurred while updating the comment:', err.message);
    res.status(500).json({ message: 'Error occurred while updating the comment', error: err.message });
  }
});



// Delete comment
// --------------

router.delete('/:commentId', withAuth, async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId);

    // Find the comment to delete
    const existingComment = await Comment.findByPk(commentId);
    if (!existingComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the current user is the author of the comment
    if (existingComment.user_id !== req.session.user_id) {
      return res.status(403).json({ message: 'You are not authorized to delete this comment' });
    }

    // Delete the comment
    await existingComment.destroy();

    // Respond with a success message
    res.status(200).json({ message: 'Comment deleted successfully' });

  } catch (err) {
    // Log and respond with error message
    console.error('Error occurred while deleting the comment:', err.message);
    res.status(500).json({ message: 'Error occurred while deleting the comment', error: err.message });
  }
});









module.exports = router;