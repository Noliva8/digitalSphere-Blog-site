const router = require('express').Router();
const { User, Post } = require('../../models');
const withAuth = require('../../utils/auth');


// display all posts
// ----------------

router.get('/', async (req, res) =>{
  try{

const posts = await Post.findAll({
  include: {
    model: User,
    attributes: ['name']
  }
});

res.status(200).json(posts)
  } catch(err){
res.status(400).json(err);
  }
})

// create new post
// -------------

router.post('/', withAuth, async (req, res) => {
  try {
    const newPost = await Post.create({
      ...req.body,
      user_id: req.session.user_id,
    }
    );


const newPostWithUser = await Post.findByPk(newPost.id, {
  include:{
    model: User,
    attributes: ['name']
  }
  
})


    res.status(200).json(newPostWithUser);
  } catch (err) {
    res.status(400).json(err);
  }

});


// update post
// ---------

router.put('/:id', withAuth, async (req, res) =>{
  try{

    const updated = await Post.update(req.body, 
      {where : {
        id : req.params.id
      
    }});

     if (updated) {
      const updatedPost = await Post.findByPk(req.params.id, {
        include: [{ model: User }]
      });
      res.json(updatedPost);


  }
  else{
    res.status(404).json({ message: 'post not found' });
  }

  }catch(err){
res.status(500).json({ message: 'Failed to update post', error: err.message });
  }
})


// delete a post
// --------------

router.delete('/:id', withAuth, async (req, res) => {
  try {
    const postData = await Post.destroy({
      where: {
        id: req.params.id,
        user_id: req.session.user_id,
      },
    });

    if (!postData) {
      res.status(404).json({ message: 'No post found with this id!' });
      return;
    }

    res.status(200).json({ message: 'post deleted successfully'});
  } catch (err) {
    res.status(500).json(err);
  }
});





module.exports = router;
