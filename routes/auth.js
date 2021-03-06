const express = require("express");
const router = new express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const userModel = require("./../models/User");
const uploader = require("./../config/cloudinary");

const minPasswordLength = 6;

router.post("/signup", uploader.single("avatar"), (req, res, next) => {
    var errorMsg = "";
    const { username, password, email, firstName, lastName, city } = req.body;
    // @todo : best if email validation here or check with a regex in the User model
    if (!password || !email) {
        errorMsg += "Provide email and password. ";
    }

    if (password.length < minPasswordLength)
        errorMsg += `Please make your password at least ${minPasswordLength} characters.`;

    if (errorMsg) return res.status(403).json(errorMsg); // 403	Forbidden

    const salt = bcrypt.genSaltSync(10);
    // more on encryption : https://en.wikipedia.org/wiki/Salt_(cryptography)
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = {
        username,
        email,
        password: hashPass,
        firstName,
        lastName,
        city
    };

    // check if an avatar FILE has been posted
    if (req.file) newUser.avatar = req.file.secure_url;

    userModel
        .create(newUser)
        .then(newUserFromDB => {
            res.status(200).json({ msg: "signup ok" });
        })
        .catch(err => {
            errorMsg = "username or mail allready exist"
            res.status(403).json(errorMsg);
        });
});


router.post("/signin", (req, res, next) => {
    var errorMsg = "";
    passport.authenticate("local", (err, user, failureDetails) => {


        if (err || !user) {
            errorMsg= "invalid user infos";
            return res.status(403).json(errorMsg) // 403 : Forbidden
        }
        /**
         * req.Login is a passport method
         * check the doc here : http://www.passportjs.org/docs/login/
         */
        req.logIn(user, function (err) {
            /* doc says: When the login operation completes, user will be assigned to req.user. */
            if (err) {
            errorMsg= "Something went wrong logging in";
            return res.status(403).json(errorMsg) // 403 : Forbidden
        }

            // We are now logged in
            // You may find usefull to send some other infos
            // dont send sensitive informations back to the client
            // let's choose the exposed user below
            const { _id, username, email, avatar, firstName, lastName, city } = user;
            // and only expose non-sensitive inofrmations to the client's state
            next(
                res.status(200).json({
                    currentUser: {
                        _id,
                        username,
                        email,
                        avatar,
                        firstName,
                        lastName,
                        city
                    }
                })
            );
        });
    })(req, res, next); // IIFE (module) pattern here (see passport documentation)
});


router.post("/signout", (req, res, next) => {
    req.logout(); // utility function provided by passport
  res.json({ message: "Success" });
});


router.use("/is-loggedin", (req, res, next) => {
    if (req.isAuthenticated()) {
        // method provided by passport
        const { _id, username, email, avatar, firstName, lastName, city } = req.user;
        return res.status(200).json({
            currentUser: {
                _id,
                username,
                email,
                avatar,
                firstName,
                lastName,
                city
            }
        });
    }
    res.status(403).json("Unauthorized");
});



module.exports = router;