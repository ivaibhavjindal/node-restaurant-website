const express = require("express");
const bodyParser = require("body-parser");

const cors = require("./cors");
const authenticate = require("../authenticate");

const Favorites = require("../models/favorites");

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

//routes for favoriteRouter (mounted @ '/favorites') Route
favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate("user")
      .populate("dishes")
      .exec((err, favorites) => {
        if (err) {
          return next(err);
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
      });
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }, (err, favorite) => {
      if (err) return next(err);
      if (!favorite) {
        Favorites.create({
          user: req.user._id,
        })
          .then((favorite) => {
            for (let i = 0; i < req.body.length; i++) {
              if (favorite.dishes.indexOf(req.body[i]._id) === -1) {
                favorite.dishes.push(req.body[i]);
              }
            }
            favorite
              .save()
              .then((favorite) => {
                Favorites.findById(favorite._id)
                  .populate("user")
                  .populate("dishes")
                  .then(
                    (favorite) => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(favorite);
                    },
                    (err) => next(err)
                  );
              })
              .catch((err) => next(err));
          })
          .catch((err) => next(err));
      } else {
        for (let i = 0; i < req.body.length; i++) {
          if (favorite.dishes.indexOf(req.body[i]._id) === -1) {
            favorite.dishes.push(req.body[i]);
          }
        }
        favorite
          .save()
          .then((favorite) => {
            Favorites.findById(favorite._id)
              .populate("user")
              .populate("dishes")
              .then(
                (favorite) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorite);
                },
                (err) => next(err)
              );
          })
          .catch((err) => next(err));
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader("Content-Type", "text/plain");
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({ user: req.user._id }, (err, resp) => {
      if (err) return next(err);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(resp);
    });
  });

favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.corsWithOptions, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        (favorites) => {
          if (!favorites) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({ exists: false, favorites: favorites });
          } else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json({ exists: false, favorites: favorites });
            } else {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json({ exists: true, favorites: favorites });
            }
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  //Require authentication for post, put and delete requests
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }, (err, favorite) => {
      if (err) return next(err);
      if (!favorite) {
        Favorites.create({ user: req.user._id })
          .then((favorite) => {
            favorite.dishes.push({ _id: req.params.dishId });
            favorite
              .save()
              .then((favorite) => {
                Favorites.findById(favorite._id)
                  .populate("user")
                  .populate("dishes")
                  .then(
                    (favorite) => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(favorite);
                    },
                    (err) => next(err)
                  );
              })
              .catch((err) => next(err));
          })
          .catch((err) => next(err));
      } else {
        if (favorite.dishes.indexOf(req.params.dishId) === -1) {
          favorite.dishes.push({ _id: req.params.dishId });
          favorite
            .save()
            .then((favorite) => {
              Favorites.findById(favorite._id)
                .populate("user")
                .populate("dishes")
                .then(
                  (favorite) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  },
                  (err) => next(err)
                );
            })
            .catch((err) => next(err));
        } else {
          res.statusCode = 403;
          res.setHeader("Content-Type", "text/plain");
          res.end(`Dish ${req.params.dishId} already present`);
        }
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader("Content-Type", "text/plain");
    res.end(`PUT operation not supported on /dishes/${req.params.dishId}`);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }, (err, favorite) => {
      if (err) {
        return next(err);
      }
      favorite.dishes = favorite.dishes.filter((id) => id != req.params.dishId);
      favorite
        .save()
        .then((favorite) => {
          Favorites.findById(favorite._id)
            .populate("user")
            .populate("dishes")
            .then(
              (favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              },
              (err) => next(err)
            );
        })
        .catch((err) => next(err));
    });
  });

module.exports = favoriteRouter;
