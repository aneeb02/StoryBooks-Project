const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const morgan = require("morgan");
const { create } = require("express-handlebars");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const mongoose = require("mongoose");
const methodOverride = require("method-override")

dotenv.config({ path: './config/config.env' });

require('./config/passport')(passport);

connectDB();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Morgan for logging requests in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//override methods
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  })
)


const { formatDate, stripTags, truncate, editIcon } = require('./helpers/hbs') 

// Handlebars setup
const hbs = create({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    formatDate,
    stripTags,
    truncate,
    editIcon
  },
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Session middleware
app.use(session({
  secret: 'juice',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

// Routes
app.use('/', require('./routes/main'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
