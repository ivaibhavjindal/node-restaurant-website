const express = require("express");
const bodyParser = require("body-parser");

const cors = require("./cors");
const authenticate = require("../authenticate");

const Leaders = require("../models/leaders");

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

//routes for leaderRouter (mounted @ '/leaders') Route
leaderRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Leaders.find(req.query)
      .then(
        (leaders) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(leaders);
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
      Leaders.create(req.body)
        .then(
          (leader) => {
            console.log("Leader Added ", leader);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(leader);
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
      res.end("PUT operation not supported on /leaders");
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res, next) => authenticate.verifyAdmin(req, res, next),
    (req, res, next) => {
      Leaders.remove({})
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

// Specific Leader Methods
leaderRouter
  .route("/:leaderId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Leaders.findById(req.params.leaderId)
      .then(
        (leader) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(leader);
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
      res.end(
        "POST operation not supported on /leaders/" + req.params.leaderId
      );
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res, next) => authenticate.verifyAdmin(req, res, next),
    (req, res, next) => {
      Leaders.findByIdAndUpdate(
        req.params.leaderId,
        {
          $set: req.body,
        },
        { new: true }
      )
        .then(
          (leader) => {
            res.statusCode = 200;
            res.setHeader("Content-Header", "application/json");
            res.json(leader);
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
      Leaders.findByIdAndRemove(req.params.leaderId)
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

module.exports = leaderRouter;
