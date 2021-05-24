const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');//error handling for async functions
const Campground = require('../models/campground');//campground database model
const campgrounds = require('../controllers/campgrounds') 
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
 
router.get('/new', isLoggedIn, campgrounds.renderNewForm);


router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, catchAsync(campgrounds.deleteCampground))


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


module.exports = router;