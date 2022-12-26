//BUILT-IN
const path = require("path");

//3RD-PARTY-PACKAGES
const express = require("express");
const session = require("express-session");
const connectSessionSeq = require("connect-session-sequelize");

const { sequelize, User } = require("./models/index");

// SEQSESSION-SETUP
const seqStore = connectSessionSeq(session.Store);
const myStore = new seqStore({
  db: sequelize,
  tableName: "user_sessions",
});

// SEQSESSION-SETUP
const demoRoutes = require("./routes/demo");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "SUPER_SECRET_KEY",
    resave: false, // if set to false --  session will not be resaved if unmodified
    name: "sess_ID",
    saveUninitialized: false,
    cookie: {
      // path: "/",
      httpOnly: true, //cannot be accessed by document.cookie
      // secure: true, //if true -- can only be sent back by the client with every request if the site is https enabled
      maxAge: 24 * 60 * 60 * 1000, //time in miliseconds 4 the cookie to expire
    },
    name: "auth-sess",
    store: myStore,
  })
);
app.use(async (req, res, next) => {
  const isAuthenticated = req.session.isAuthenticated;

  const user = req.session.user;
  if (!isAuthenticated || !user) {
    return next();
  }
  const userRow = await User.findOne({ where: { id: user.id } });
  res.locals.isAuthenticated = req.session.isAuthenticated;
  res.locals.isAdmin = userRow.is_admin;
  return next();
});
app.use(demoRoutes);

app.use(function (error, req, res, next) {
  res.render("500");
});

sequelize.authenticate().then(() => {
  console.log("AUTHED_______");
  app.listen(5000, console.log("listening"));
});
