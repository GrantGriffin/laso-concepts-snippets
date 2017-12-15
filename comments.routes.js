//provides a class to create modular, mountable route handlers
const router = require('express').Router()

const commentsController = require('../controllers/comments.controller')
const validateBody = require('../filters/validate.body')
const Comment = require('../models/comment')  //pascal case?
const crudFilter = require('../filters/crud.filters')


module.exports = router
//api routes ======================================================
router.get('/', commentsController.readAll)
router.get('/:id([0-9a-fA-F]{24})', commentsController.readById)
router.post('/', validateBody(Comment), crudFilter.disallowId, commentsController.create)  //pascal case?
router.put('/:id([0-9a-fA-F]{24})',  validateBody(Comment), crudFilter.requireId, crudFilter.validateIdMatch, commentsController.update)
router.delete('/:id([0-9a-fA-F]{24})', commentsController.delete)