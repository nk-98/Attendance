const express = require("express"); 
const app = express();
const session = require("express-session");
const config = require("./config");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const User = require("./models/user");
const bodyParser = require("body-parser");
app.set("view engine", "ejs");


mongoose.connect(config.db.connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//Boilerplate middleware for using packages mostly
app.use(session({
    secret: config.secret.keyOne,
    resave: false,
    saveUninitialized: false
}))
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());

//Stores user.id for the session
passport.serializeUser(function (user, done) {
    done(null, user.id);
})

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    })
})



passport.use(new localStrategy(User.authenticate()));
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next;
    } else {
        res.redirect("/");
    }
}

//Routes
app.get("/", (req, res) => {
        try {
            res.render("landing");
        } catch(err) {
            console.log(err);
            res.send("Error loading the landing page");
        }
})

app.get("/create", (req, res) => {
    try {
        res.render("create")
    } catch(err) {
        console.log(err);
        res.send("Error trying to load the User creation page");
    }
})

app.post("/create", async (req, res) => {
    try {
        //Adding a new user to the database with the params which were added in the creation form. Passport/Mongoose
        //middleware handles the creation to the database.
        const newUser = await User.register(new User({
            username: req.body.username,
            auth: req.body.auth
        }), req.body.password);
        passport.authenticate("local")(req, res, () => {
            res.redirect("/");
        })
    }
    catch(err) {
        console.log(err);
        res.send("Error trying to create a new user");
    }
})

app.post("/login", passport.authenticate("local", {
    successRedirect: "/create",
    failureMessage: "Failed to login"
}))

app.listen(3000, () => {
    console.log("App is running...");
})

