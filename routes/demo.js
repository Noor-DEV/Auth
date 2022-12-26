const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();

const { User } = require("../models/index");

router.get("/", function (req, res) {
  res.render("welcome");
});

router.get("/signup", function (req, res) {
  let { formAlert } = req.session;
  if (!formAlert) {
    formAlert = {
      hasError: false,
      email: null,
      password: null,
      confirmEmail: null,
    };
  }

  req.session.formAlert = null;

  res.render("signup", {
    data: { formAlert },
  });
});
router.post("/signup", async function (req, res) {
  const { email, password, ["confirm-email"]: confirmEmail } = req.body;
  try {
    if (
      !email.trim().length ||
      !email.includes("@") ||
      password.trim().length < 6 ||
      email !== confirmEmail
    ) {
      req.session.formAlert = {
        hasError: true,
        email,
        password,
        confirmEmail,
        message: "Check the data you entered -- INVALID INPUT",
      };
      return req.session.save(() => {
        return res.redirect("/signup");
      });
      // return res.json({ msg: "CREDENTIALS_NOT_VALID" });
    }
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      console.log(userExists, "--------userExists---------");
      req.session.formAlert = {
        hasError: true,
        email,
        password,
        confirmEmail,
        message:
          "The User Already Exists... Try logging in if it's really you!",
      };
      return req.session.save(() => {
        return res.redirect("/signup");
      });
      // return res.json({ msg: "USER_ALREADY_EXISTS" });
    }
    const hashedPwd = await bcrypt.hash(password, 12);
    await User.create(
      { email, password: hashedPwd },
      { fields: ["email", "password"] }
    );
    console.log("user_created");
    return res.redirect("/login");
  } catch (err) {
    console.log("USER_NOT_CREATED");
    return res.json({
      msg: "USER_NOT_CREATED_ERR",
      content: err.message,
      err,
    });
  }
});

router.get("/login", function (req, res) {
  res.render("login");
});
router.post("/login", async function (req, res) {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser) {
      console.log("NON_EXISTENT_USER");
      return res.json({ msg: "NON_EXISTENT_USER" });
    }

    const match = await bcrypt.compare(
      password,
      existingUser.toJSON().password
    );
    if (match) {
      console.log("USER_LOGGED_IN");
      req.session.user = {
        id: existingUser.id,
        email: existingUser.email,
      };
      req.session.isAuthenticated = true;
      req.session.save(() => {
        res.redirect("/profile");
      });
    } else {
      console.log("PASSWORD_INCORRECT");
      return res.json({ msg: "PASSWORD_INCORRECT" });
    }
  } catch (err) {
    console.log("ERROR__LOGGING_THE_USER_IN...........");
    res.json({
      err,
      errMessage: err.message,
      msg: "ERROR__LOGGING_THE_USER_IN...........",
    });
  }
});
router.post("/logout", function (req, res) {
  req.session.isAuthenticated = false;
  req.session.user = null;
  res.redirect("/");
});

router.get("/admin", async function (req, res) {
  if (!req.session.isAuthenticated) {
    return res.status(401).render("401");
  }
  const theUser = await User.findOne({ where: { id: req.session.user.id } });
  if (theUser.is_admin) {
    return res.render("admin");
  } else {
    return res.status(403).render("403");
  }
});
router.get("/profile", function (req, res) {
  if (!req.session.isAuthenticated) {
    return res.status(401).render("401");
  }
  res.render("profile");
});

module.exports = router;
