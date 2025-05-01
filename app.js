require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const authRoutes = require("./routes/auth");
const indexRoutes = require("./routes/index");
require("./config/passport");

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.set("view engine", "ejs");
app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", indexRoutes);
app.use("/auth", authRoutes);

app.listen(8000, () => console.log("Server running on http://localhost:8000"));
