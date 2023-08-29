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

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid; // {pid: 'p1'}

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place.",
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided id.",
      404 //nic nie znaleziono
    );
    return next(error);
  }

  //gettters pozbędzie się _
  res.json({ place: place.toObject({ getters: true }) }); // => {place} => {place: place}
};

// function getPlaceById() {...}
// const getPlaceById = function { ... }

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let places;
  try {
    //samo find zwróci wszystkie miejsca, używając creator: userId zwróci miejsca danego użytkownika
    places = await Place.find({ creator: userId });
  } catch (err) {
    const error = new HttpError(
      "Fetching places failed, please try again later",
      500
    );
    return next(error);
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find a places for the provided user id.", 404)
    ); //next nie zatrzymuje wykonywania funkcji dlatego return
  }

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
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

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req); //sprawdzi czy są jakieś błędy (żeby nie dodać pustego miejsca)
  if (!errors.isEmpty()) {
    throw new HttpError("Invaild inputs passed, please chceck you data.", 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) }); // nie 201, bo nie jest to nowa rzecz, tylko update
};
const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  try {
    await place.deleteOne();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
