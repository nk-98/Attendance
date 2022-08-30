const express = require("express"); 
const app = express();
const session = require("express-session");
const config = require("./config");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const User = require("./models/user");
const Attend = require("./models/attend")
const Leave = require("./models/leave")
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const morgan = require("morgan");
const user = require("./models/user");
app.set("view engine", "ejs");
app.use(morgan("tiny"));
app.use(methodOverride("_method"));
//Script to get current date
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

//Database connection through config + mongoose boilerplate
mongoose.connect(config.db.connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

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

//Function to check if the user is logged in. If the user is authenticated, isAuthenticated returns true and this
//function returns next, which means it will skip to the next route.
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect("/");
    }
}

//Same as above but to check if the user is Admin
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.auth === "admin") {
        return next();
    } else {
        res.redirect("/");
    }
}

//Routes
app.get("/", async (req, res) => {
        try {
            //Loading the index page if the user is logged in, otherwise the landing page(login).
            //Then finding the attends where userId is equal to the user.id of the person who is currently logged in.
            if (req.isAuthenticated()) {
                const attends = await Attend.find({userId: req.user.id}).exec();
                const leaves = await Leave.find({userId: req.user.id}).exec();
                res.render("index", {attends, leaves});
            } else {
                res.render("landing");
            }
        } catch(err) {
            console.log(err);
            res.send("Error loading the home/login page");
        }
})

app.get("/create", isAdmin, (req, res) => {
    try {
        res.render("create");
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
    successRedirect: "/",
    failureRedirect: "/"
}))

app.get("/logout", function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect("/");
    });
  });

app.get("/attendance", isLoggedIn, (req, res) => {
    try {
        res.render("attendance");
    } catch(err) {
        console.log(err);
    }
})

app.get("/leave", isLoggedIn, (req, res) => {
    try {
        res.render("leave");
    } catch(err) {
        console.log(err);
    }
})

app.post("/leave", isLoggedIn, async (req, res) => {
    try {
        const newLeave = await Leave.create(new Leave({
            date: req.body.date,
            absent: req.body.whole ? req.body.whole : req.body.start + "-" + req.body.end,
            reason: req.body.reason,
            status: req.body.status,
            userId: req.body.userId,
            username: req.body.username
        }))
        console.log(newLeave);
        res.redirect("/");
    } catch(err) {
        console.log(err)
    }
})

app.get("/leaveUpdate/:id", isLoggedIn, async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id).exec();
        res.render("leaveUpdate", {leave});
    } catch(err) {
        console.log(err);
    }
})

app.put("/leaveUpdate/:id", isLoggedIn, async (req, res) => {
    const leave = {
        date: req.body.date,
        absent: req.body.whole ? req.body.whole : req.body.start + "-" + req.body.end,
        reason: req.body.reason
    }
    try {
        await Leave.findByIdAndUpdate(req.params.id, leave, {new: true}).exec();
        if(req.user.auth === "admin") {
            res.redirect("/control");
        } else {
            res.redirect("/");
        }
    } catch(err) {
        console.log(err);
    }
})

app.get("/leaveApprove/:id", isAdmin, async (req, res) => {
    try {
        await Leave.findByIdAndUpdate(req.params.id, {status: "Approved"}, {new: true}).exec();
        res.redirect("/control");
    } catch(err) {
        console.log(err);
    }
})

app.get("/leaveReject/:id", isAdmin, async (req, res) => {
    try {
        await Leave.findByIdAndUpdate(req.params.id, {status: "Rejected"}, {new: true}).exec();
        res.redirect("/control");
    } catch(err) {
        console.log(err);
    }
})

app.get("/update/:id", isLoggedIn, async (req, res) => {
    try {
        const attend = await Attend.findById(req.params.id).exec();
        res.render("update", {attend});
    } catch(err) {
        console.log(err);
    }
})

app.put("/update/:id", isLoggedIn, async (req, res) => {
    const attend = {
        start: req.body.start,
        end: req.body.end
    }
    try {
        await Attend.findByIdAndUpdate(req.params.id, attend, {new: true}).exec();
        if(req.user.auth === "admin") {
            res.redirect("/control");
        } else {
            res.redirect("/");
        }
    } catch(err) {
        console.log(err);
    }
})

app.get("/control", isAdmin, async (req, res) => {
    try {
            const leaves = await Leave.find({}).exec();
            const attends = await Attend.find({}).exec();
            res.render("control", {attends, leaves});
    } catch(err) {
        console.log(err);
    }
})

app.get("/control/search", isAdmin, async (req, res) => {
    try {
        const attends = await Attend.find({
            $text: {
                $search: req.query.term
            }
        })
        const leaves = await Leave.find({
            $text: {
                $search: req.query.term
            }
        })
        res.render("control", {attends, leaves});
    } catch(err) {
        console.log(err);
    }
})

app.post("/attendance", async (req, res) => {
    try {
        const newAttend = await Attend.create(new Attend({
            date: req.body.date,
            start: req.body.start,
            end: req.body.end,
            userId: req.body.userId,
            username: req.body.username
        }))
        console.log(newAttend);
        res.redirect("/");
    } catch(err) {
        console.log(err);
    }
})

app.listen(3000, () => {
    console.log("App is running...");
})

