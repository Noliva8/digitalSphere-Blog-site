const sequelize = require('../config/connection');
const { User, Post, Comment } = require('../models');

// 

const userData = require('./userData.json');
const postData = require('./postData.json');
const commentData = require('./commentData.json');



const seedDatabase = async () => {
  await sequelize.sync({ force: true });
    console.log('--- Database synced ---');


    // seeding UserData first
    // ---------------------
  const users = await User.bulkCreate(userData, {
    individualHooks: true,
    returning: true,
  });
  console.log('--- userData seeded ---');


  // seeding Post
  // ------------
  const posts = await Post.bulkCreate(postData, {
 individualHooks: true,
    returning: true,
  });
  console.log('--- postData seeded ---');


// Seeding comment 
// --------------
const comment = await Comment.bulkCreate(commentData, {
   individualHooks: true,
    returning: true,
});
 console.log('--- comments seeded ---');

  process.exit(0);
};


seedDatabase();
