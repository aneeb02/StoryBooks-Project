const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const morgan = require("morgan");
const { create } = require("express-handlebars");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require('connect-mongo')
const mongoose = require("mongoose");

dotenv.config({ path: './config/config.env' });

require('./config/passport')(passport)

connectDB();

const app = express();


// Morgan for logging requests in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Handlebars setup for v7.1.3
const hbs = create({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials')
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));



//middleware for e-session
app.use(session({
  secret: 'juice',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}))

//middleware for passport
app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});


app.use(express.static(path.join(__dirname, 'public')))


const PORT = process.env.PORT || 3000;

// Routes
app.use('/', require('./routes/main'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
