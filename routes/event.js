const express = require("express");
const router = new express.Router();
const EventModel = require("../models/Event");


router.get("/", (req, res, next) => {
    EventModel
    .find()
    .populate("user")
    .then(dbRes => res.status(200).json({ events: dbRes }))
    .catch(next);});



router.get("/:id", (req, res, next) => {
    EventModel.findById(req.params.id)
    .populate("sport")
    .then(event => {
    res.status(200).json(event)
    }).catch(err => {
    res.status(500).json(err)
    })
    });


router.post("/create", (req, res, next) => {
    const newEvent = {...req.body}
    // newEvent.creator = req.session.currentUser.id
    // newEvent.participants.push(req.session.currentUser.id)
    EventModel.create(newEvent)
    .then((results) => {
        res.status(200).json({ msg: "OK"})
    }).catch(err => {
        res.status(500).json(err)
    })

});


router.patch("/edit/:id", (req, res, next) => {
    const Eventvalues = req.body;


    EventModel.findByIdAndUpdate(req.params.id, Eventvalues)
    .then((results) => {
          res.status(200).json({ msg: "OK" })
    }).catch(err => {
    res.status(500).json(err)
    })

});


router.delete("/:id", (req, res, next) => {
    EventModel
    .findByIdAndDelete(req.params.id)
    .then(dbRes => res.json(dbRes))
    .catch(next);
});



module.exports = router;