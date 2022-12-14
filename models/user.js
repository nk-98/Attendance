const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

//Variable for creating a new user to the database. Password creation is handled by passport.js.
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    auth: {
        type: String,
        required: true
    }
})

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);

