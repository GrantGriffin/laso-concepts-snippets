const Comment = require('../models/comment')
const mongodb = require('../mongodb')
const conn = mongodb.connection
const ObjectId = mongodb.ObjectId

module.exports = {
    readAll: readAll
    , readById: readById
    , create: create
    , update: update
    , deactivate: deactivate
}

function readAll() {
    return conn.db().collection('comments').find({ dateDeactivated: null }).toArray()
        .then(comments => {
            for (let i = 0; i < comments.length; i++) {
                let comment = comments[i]
                comment._id = comment._id.toString()
                comment.profileId = comment.profileId.toString()
                comment.subject.id = comment.subject.id.toString()
            }
            return comments
        })
}

function readById(id) {
    return conn.db().collection('comments').findOne({ _id: new ObjectId(id), 'dateDeactivated': null })
        .then(comment => {
            comment._id = comment._id.toString()
            comment.profileId = comment.profileId.toString()
            comment.subject.id = comment.subject.id.toString()
            return comment
        })
}

function create(model) {
    model.profileId = new ObjectId(model.profileId)
    model.subjectId = new ObjectId(model.subject.id)
    model.dateCreated = new Date()
    model.dateModified = new Date()
    model.dateDeactivated = null
    return conn.db().collection('comments').insert(
        {
            profileId: model.profileId,
            content: model.content,
            subject:
            {
                type: model.subject.type,
                id: model.subject.id
            },
            dateCreated: model.dateCreated,
            dateModified: model.dateModified,
            dateDeactivated: model.dateDeactivated
        }
    )
        .then(result => {
            result.insertedIds[0].toString()
        })
}

function update(id, doc) {
    doc.dateModified = new Date()
    doc.subjectId = new ObjectId(doc.subject.id)
    return conn.db().collection('comments').updateOne({ _id: new ObjectId(id) },
        {$set:
            {
                content: doc.content,
                subject:
                {
                    type: doc.subject.type,
                    id: doc.subject.id
                },
                dateCreated: doc.dateCreated,
                dateModified: doc.dateModified
            }
        }
    )
        .then(result => Promise.resolve())
}

function deactivate(id) {
    return conn.db().collection('comments').updateOne(
        { _id: new ObjectId(id) }
        , {
            $currentDate:
            {
                dateDeactivated: true
                , dateModified: true
            }
        }
    )
        .then(result => Promise.resolve())

}