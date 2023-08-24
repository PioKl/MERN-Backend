const express = require("express");

const placesControllers = require("../controllers/places-controllers");

const router = express.Router();

//kolejność tych 'routów' ma znaczenie

router.get("/:pid", placesControllers.getPlaceById);

router.get("/user/:uid", placesControllers.getPlaceByUserId);

router.post("/", placesControllers.createPlace);

module.exports = router;
