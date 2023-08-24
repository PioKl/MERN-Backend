const express = require("express");

const { check } = require("express-validator");

const placesControllers = require("../controllers/places-controllers");

const router = express.Router();

//kolejność tych 'routów' ma znaczenie

router.get("/:pid", placesControllers.getPlaceById);

router.get("/user/:uid", placesControllers.getPlacesByUserId);

//check jest w celu sprawdzenia, czy są jakieś puste miejsca gdy tworzy się miejsce
router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesControllers.createPlace
);

router.patch("/:pid", placesControllers.updatePlace);

router.delete("/:pid", placesControllers.deletePlace);

module.exports = router;
