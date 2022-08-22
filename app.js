const express = require("express"); 
const app = express();

app.set("view engine", "ejs");

app.get("/", (req, res) => {
        try {
            res.render("landing");
        } catch(err) {
            console.log(err);
        }
})


app.listen(3000, () => {
    console.log("App is running...");
})