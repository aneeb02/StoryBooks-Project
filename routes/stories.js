const express = require("express");
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Story = require("../models/Story");
const multer = require('multer');
const path = require('path');
const { format } = require('date-fns');


// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });



// @route GET /stories/add
// @desc  Show add page
router.get('/add', ensureAuth, (req, res) => {
  res.render('stories/add', { user: req.user });
});

// @route POST /stories
// @desc  Process add form
router.post('/', ensureAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, body, status } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    await Story.create({
      title,
      body,
      status: status || 'public',
      image,
      user: req.user.id
    });
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});


// @route GET /stories
// @desc  Show all stories
router.get('/', ensureAuth, async(req, res) => {
  try {
    const stories = await Story.find({status: 'public'}).populate('user').sort({createdAt: 'desc'}).lean();
    res.render('stories/index', {
      stories,
    })
  } catch (error) {
      console.error(error);
      res.render('error/500')
  }

});

router.get('/:id', ensureAuth, async(req, res) => {
  try {
    let story = await Story.findById(req.params.id).populate('user').lean();

    if(!story)
      return res.render('error/404')
    res.render('stories/show', {story})
  } catch (error) {
      console.error(error);
      res.render('error/404');
  }
});

// @route GET /stories/user/:userId
// @desc  Show stories by user
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({
      user: req.params.userId,
      status: 'public'
    }).populate('user').lean();

    res.render('stories/index', {
      stories
    });
  } catch (error) {
    console.error(error);
    res.render('error/500');
  }
});


router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    await Story.deleteOne({ _id: req.params.id });
    alert("Story Deleted");
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.render('error/500');
  }
});



module.exports = router;
