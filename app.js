if(process.env.NODE_ENV !=='production') {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const engine = require('ejs-mate'); //ejs-mate
//express error handling
const ExpressError = require('./utils/ExpressError');
//express routes
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
//express session
const session = require('express-session');
//express flash
const flash = require('connect-flash');
//passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user'); //user model for passport
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const { scriptSrcUrls, styleSrcUrls, connectSrcUrls, fontSrcUrls} = require('./utils/helmetConfig')
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
const MongoStore = require('connect-mongo');

// 'mongodb://localhost:27017/yelp-camp'
//mongoose connection
mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false});

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();
const path = require('path');

app.engine('ejs', engine)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')) // folder for ejs files

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public'))); //folder for static files 
app.use(mongoSanitize());//removes $ and . from req.query

const secret = process.env.SECRET || 'squirrel'

const store = MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/yelp-camp',
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on('error', function (e) {
    console.log('Session store error', e)
})
//set values for session cookie
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + (1000*60*60*24*7),
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/nohero/",  
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//express middleware for flashes
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


//express routers
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

//home page
app.get('/', (req, res) => {
    res.render('home')
});


//check for wrong url(404)
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

//error handling using express middleware
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = "Oh no, Something went wrong!"
    res.status(statusCode).render('error', {err});
});





app.listen(3000, () => {
    console.log("Server started on port 3000");
});