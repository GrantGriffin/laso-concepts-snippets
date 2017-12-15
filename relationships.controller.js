
const responses = require('../models/responses')
const relationshipService = require('../services/relationships.service')
const apiPrefix = 'api/relationships'

module.exports = {
    getRelationships: _getRelationships
}

function _getRelationships(req, res) {
     relationshipService.getRelationships(req.model, req.auth)
        .then( (msgs) => {
            const responseModel = new responses.ItemsResponse()
            responseModel.items = msgs
            res.json(responseModel)
        })
        .catch(err => {
            console.log(err)
            res.status(500).send(new responses.ErrorResponse(err))
        })   
}