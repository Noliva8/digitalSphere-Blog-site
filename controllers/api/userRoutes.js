const router = require('express').Router();
const { User } = require('../../models');
const withAuth = require('../../utils/auth');



// GET ALL THE USERS
// ----------------

router.get('/', async (req, res) => {
  try{
    const allUsers = await User.findAll();

    console.log(allUsers);

    res.status(200).json(allUsers);

  }catch(error){
     res.status(400).json(error);
  }
})


// Find user by id
// ---------------

router.get('/:id', withAuth, async (req, res) => {
  try {
    // Fetch user by primary key
    const userById = await User.findByPk(req.params.id);

    // Check if user exists
    if (!userById) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send response with user data
    res.status(200).json(userById);

  } catch (err) {
    // Log the error for debugging purposes
    console.error('Error occurred while finding the user:', err);
    res.status(500).json({ message: 'Error occurred while finding the user' });
  }
});




// Find user by name
// ---------------

// Define the route to get a user by name
router.get('/:name', withAuth, async (req, res) => {
  try {
    // Extract the name parameter from the request
    const userName = req.params.name;

    console.log(`Searching for user with name: ${userName}`); // Debugging log

    // Fetch the user by name
    const userByName = await User.findOne({
      where: {
        name: userName
      }
    });

    // Check if user was found
    if (!userByName) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Respond with user data
    res.status(200).json(userByName);

  } catch (err) {
    // Log and respond with error message
    console.error('Error occurred while finding the user:', err.message);
    res.status(500).json({ message: 'Error occurred while finding the user', error: err.message });
  }
});


// sign up
// -------
router.post('/', async (req, res) => {
  try {
    
    const userData = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      res.status(200).json(userData);
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

// login
// -----

router.post('/login', async (req, res) => {
  try {

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    // check the user's email
    // --------------------
    const userData = await User.findOne({ where: { email: req.body.email } });

    if (!userData) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password, please try again' });
      return;
    }

    // check password
    // --------------

    const validPassword = await userData.checkPassword(req.body.password);

    if (!validPassword) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password, please try again' });
      return;
    }

    // save the user session
    // -------------------

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;
      
      res.json({ user: userData, message: 'You are now logged in!' });
    });

  } catch (err) {
    res.status(400).json(err);
  }
});



// logout
// ------

router.post('/logout', (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

module.exports = router;
