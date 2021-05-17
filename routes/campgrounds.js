const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const {campgroundSchema} = require('../schemas'); //Joi schema


//campground data validation using Joi and express middleware
const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', async (req, res) => {
    const campgrounds =  await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
  });
  //create new campground
router.get('/new', (req, res) => {
      res.render('campgrounds/new')
  });
  //show all campgrounds
router.post('/', validateCampground, catchAsync(async (req, res, next) => {
      const campground = new Campground(req.body.campground);
      await campground.save();
      req.flash('success', 'Successfully made a new Campground!')
      res.redirect(`/campgrounds/${campground._id}`)
  }));
  //show campground by id
router.get('/:id', catchAsync(async (req, res) => {
      const campground = await Campground.findById(req.params.id).populate('reviews');
      res.render('campgrounds/show', {campground})
  }));
  //edit a campground
router.get('/:id/edit', catchAsync(async (req, res) => {
      const campground = await Campground.findById(req.params.id);
      res.render('campgrounds/edit', {campground});
  }));
  //put request to change data of a campground(edit)
router.put('/:id', validateCampground, catchAsync(async (req, res) => {
      const {id} = req.params;
      const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
      res.redirect(`/campgrounds/${campground._id}`);
  }));
  //delete a campground using delete request
router.delete('/:id', catchAsync(async (req, res) => {
      const {id} = req.params;
      await Campground.findByIdAndDelete(id);
      res.redirect('/campgrounds');
  }));
  

module.exports = router;