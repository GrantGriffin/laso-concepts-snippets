const responses = require('../models/responses')
const commentsService = require('../services/comments.service')
const apiPrefix = '/api/comments'

module.exports = {
    readAll: readAll
    , readById: readById
    , create: create
    , update: update
    , delete: _delete
}

function readAll(req, res) {
    commentsService.readAll()
        .then(comments => {
            const responseModel = new responses.ItemsResponse()
            responseModel.items = comments
            res.json(responseModel)
        })
        .catch(err => {
            res.status(500).send(new responses.ErrorResponse(err))
        })
}

function readById(req, res) {
    commentsService.readById(req.params.id)
        .then(comment => {
            const responseModel = new responses.ItemResponse()
            responseModel.item = comment
            res.json(responseModel)
        })
        .catch(err => {
            res.status(500).send(new responses.ErrorResponse(err))
        })
}

function create(req, res) {
    req.model.profileId = req.auth.profileId
    commentsService.create(req.model)
        .then(id => {
            const responseModel = new responses.ItemResponse()
            responseModel.item = id
            res.status(201)
                .location(`${apiPrefix}/${id}`)
                .json(responseModel)
        })
        .catch(err => {
            res.status(500).send(new responses.ErrorResponse(err))
        })
}

function update(req, res) {
    commentsService
        .update(req.params.id, req.model)
        .then(comment => {
            const responseModel = new responses.SuccessResponse()
            res.status(200).json(responseModel)
        })
        .catch(err => {
            res.status(500).send(new responses.ErrorResponse(err))
        })
}

function _delete(req, res) {
    commentsService
        .deactivate(req.params.id)
        .then(() => {
            const responseModel = new responses.SuccessResponse()
            res.status(200).json(responseModel)
        })
        .catch(err => {
            return res.status(500).send(new responses.ErrorResponse(err))
        })
}