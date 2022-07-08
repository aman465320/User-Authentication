const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/auidenceDB", {
  useNewUrlParser: true,
});

const audienceSchema = new mongoose.Schema({
  email: String,
  password: String,
});

audienceSchema.plugin(passportLocalMongoose);

const Audience = new mongoose.model("Audience", audienceSchema);

passport.use(Audience.createStrategy());
passport.serializeUser(Audience.serializeUser());
passport.deserializeUser(Audience.deserializeUser());

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/confirmed", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("confirmed");
  } else {
    res.redirect("/register");
  }
});
app.get("/confirmedLogin", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("confirmedLogin");
  } else {
    res.redirect("/login");
  }
});

app.post("/confirmed", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});
app.post("/confirmedLogin", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

app.post("/register", (req, res) => {
  Audience.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/confirmed");
        });
      }
    }
  );
});

app.post("/login", (req, res) => {
  const audience = new Audience({
    username: req.body.username,
    password: req.body.password,
  });
  req.logIn(audience, (err) => {
    if (err) {
      alert("Please fill the details correctly");
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/confirmedLogin");
      });
    }
  });
});

app.listen(process.env.PORT || 5000, function () {
  console.log(
    "Express server listening on port %d in %s mode",
    this.address().port,
    app.settings.env
  );
});
