const express = require("express");

const usersController = require("../controllers/users-controllers");

const router = express.Router();

//kolejność tych 'routów' ma znaczenie

router.get("/", usersController.getUsers);

router.post("/signup", usersController.signup);

router.post("/login", usersController.login);

module.exports = router;
