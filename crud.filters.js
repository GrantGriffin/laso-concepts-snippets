module.exports = {
    validateIdMatch,
    requireId,
    disallowId
}

function validateIdMatch(req, res, next) {
    if (req.model._id !== req.params.id) {
        console.log("URL params ID does not match _id in payload body")
        res.status(400).json({
            name: "ValidationError",
            details: [
                {
                    message: "URL params ID does not match _id in payload body"
                }
            ]
        })
        return
    }
    next()
}

function requireId(req, res, next) {
    if (req.model.hasOwnProperty("_id") == false) {
        console.log("_id must be included in body of payload")
        res.status(400).json({
            name: "ValidationError",
            details: [
                {
                    message: "_id must be included in payload body"
                }
            ]
        })
    return
    }
    next()
}

function disallowId(req, res, next) {
        if (req.model._id) {
            console.log("_id cannot be included in payload for post")
            res.status(400).json({
                name: "ValidationError",
                details: [
                    {
                        message: "_id cannot be included in body of payload"
                    }
                ]
            })
            return
        }
        next()
}
