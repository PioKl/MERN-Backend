const uuid = require("uuid").v4;

const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");

const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world!",
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: "20 W 34th St, New York, NY 10001",
    creator: "u1",
  },
];

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid; // {pid: 'p1'}
  const place = DUMMY_PLACES.find((p) => {
    return p.id === placeId;
  });

  if (!place) {
    throw new HttpError(
      "Could not find a place for the provided id.",
      404 //nic nie znaleziono
    );
    //throw zatrzymuje wykonywanie funkcji
  }

  res.json({ place }); // => {place} => {place: place}
};

// function getPlaceById() {...}
// const getPlaceById = function { ... }

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;

  const places = DUMMY_PLACES.filter((p) => {
    return p.creator === userId;
  });

  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find a places for the provided user id.", 404)
    ); //next nie zatrzymuje wykonywania funkcji dlatego return
  }

  res.json({ places });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req); //sprawdzi czy są jakieś błędy (żeby nie dodać pustego miejsca)
  if (!errors.isEmpty()) {
    //throw nie dziala z async
    return next(
      new HttpError("Invaild inputs passed, please chceck you data.", 422)
    );
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    //title: title
    title,
    description,
    address,
    location: coordinates,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10//Empire_State_Building_%28aerial_view%29.jpg/400px-Empire_State_Building_%28aerial_view%29.jpg",
    creator,
  });

  //store a new document in database
  try {
    //store a new document in database
    await createdPlace.save();
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace }); //201 stworzono coś nowego
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req); //sprawdzi czy są jakieś błędy (żeby nie dodać pustego miejsca)
  if (!errors.isEmpty()) {
    throw new HttpError("Invaild inputs passed, please chceck you data.", 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);

  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY_PLACES[placeIndex] = updatedPlace;

  res.status(200).json({ place: updatedPlace }); // nie 201, bo nie jest to nowa rzecz, tylko update
};
const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;

  if (DUMMY_PLACES.find((p) => p.id === placeId)) {
    throw new HttpError("Could not find a place for that id.", 404);
  }

  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
