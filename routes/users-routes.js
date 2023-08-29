const express = require("express");

const { check } = require("express-validator");

const usersController = require("../controllers/users-controllers");

const router = express.Router();

//kolejność tych 'routów' ma znaczenie

router.get("/", usersController.getUsers);

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(), //normalizeEmail() // Test@test.com => test@test.com
    check("password").isLength({ min: 6 }),
  ],
  usersController.signup
);

router.post("/login", usersController.login);

module.exports = router;