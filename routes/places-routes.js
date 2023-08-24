const express = require("express");

const placesControllers = require("../controllers/places-controllers");

const router = express.Router();

//kolejność tych 'routów' ma znaczenie

router.get("/:pid", placesControllers.getPlaceById);

router.get("/user/:uid", placesControllers.getPlacesByUserId);

router.post("/", placesControllers.createPlace);

router.patch("/:pid", placesControllers.updatePlace);

router.delete("/:pid", placesControllers.deletePlace);

module.exports = router;
