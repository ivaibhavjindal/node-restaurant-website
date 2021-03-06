const express = require("express");
const bodyParser = require("body-parser");

const cors = require("./cors");
const authenticate = require("../authenticate");

const Dishes = require("../models/dishes");

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

//routes for dishRouter (mounted @ '/dishes') Route
dishRouter
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .route("/")
  .get(cors.cors, (req, res, next) => {
    Dishes.find(req.query)
      .populate("comments.author")
      .then(
        (dishes) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dishes);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  //Require authentication for post, put and delete requests
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res, next) => authenticate.verifyAdmin(req, res, next),
    (req, res, next) => {
      Dishes.create(req.body)
        .then(
          (dish) => {
            console.log("Dish Created ", dish);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res, next) => authenticate.verifyAdmin(req, res, next),
    (req, res, next) => {
      res.statusCode = 403;
      res.end("PUT operation not supported on /dishes");
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res, next) => authenticate.verifyAdmin(req, res, next),
    (req, res, next) => {
      Dishes.remove({})
        .then(
          (resp) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(resp);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

// Specific Dish Methods
dishRouter
  .route("/:dishId")

  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate("comments.author")
      .then(
        (dish) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  //Require authentication for post, put and delete requests
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res, next) => authenticate.verifyAdmin(req, res, next),
    (req, res, next) => {
      res.statusCode = 403;
      res.end("POST operation not supported on /dishes/" + req.params.dishId);
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res, next) => authenticate.verifyAdmin(req, res, next),
    (req, res, next) => {
      Dishes.findByIdAndUpdate(
        req.params.dishId,
        {
          $set: req.body,
        },
        { new: true }
      )
        .then(
          (dish) => {
            res.statusCode = 200;
            res.setHeader("Content-Header", "application/json");
            res.json(dish);
          },
          (err) => next(err)
        )
        .catch((err) => console.log(err));
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res, next) => authenticate.verifyAdmin(req, res, next),
    (req, res, next) => {
      Dishes.findByIdAndRemove(req.params.dishId)
        .then(
          (resp) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(resp);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

module.exports = dishRouter;
