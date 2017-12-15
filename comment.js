const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const schema2 = {
    type: Joi.string().regex(/^(Blog Article|FAQ Entry|Message)$/).required()
    , id: Joi.objectId().required()
}

const schema = {
    _id: Joi.objectId().allow(null)
    , content: Joi.string().max(1000).required()
    , subject: schema2
}
module.exports = Joi.object().keys(schema)