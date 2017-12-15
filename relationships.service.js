
const Relationships = require('../models/relationships')
const profileService = require('../services/profiles.service')
const mongodb = require('../mongodb')
const conn = mongodb.connection
const ObjectId = mongodb.ObjectId

module.exports = {
    getRelationships: getRelationships
}

function getRelationships(msgs, auth) {

        return Promise.all([
            profileService.readById(auth.profileId).then( prof => auth = prof),
            profileService.readByMany(msgs).then( profs => msgs = profs)
        ])
        .then( () => {

            for ( let i = 0; i < msgs.length; i++) {
                let msg = msgs[i]

                msg._id = msg._id.toString()  //need to convert location and inst as well
                msg.userId = msg.userId.toString()
                if(msg.locationId)      { msg.locationId = msg.locationId.toString() }
                if(msg.institutionId)   { msg.institutionId = msg.institutionId.toString() }

                if ( msg._id == auth._id ) { 
                    msg.relationship = `${auth.user.address.city}, ${auth.user.address.stateCode}`
                    continue
                } 
                else if ( msg.isSuperAdmin ) { 
                    msg.relationship = 'Laso Concepts'
                    continue
                }

                if ( !auth.menteeId && !auth.isSuperAdmin ) {
                    if      ( msg.menteeId == auth._id )                { msg.relationship = 'Your Mentor' }
                    else if ( msg.locationId == auth.locationId 
                        && msg.locationId )                             { msg.relationship = ( msg.location.name ? msg.location.name : msg.location[0].name )}

                    else if ( msg.institutionId == auth.institutionId 
                        && msg.institutionId )                          { msg.relationship = ( msg.institution.name ? msg.institution.name : msg.institution[0].name )}

                    else                                                { msg.relationship = ( msg.address.city ? `${msg.address.city}, ${msg.address.stateCode}` : `${msg.address[0].city}, ${msg.address[0].stateCode}` ) }
                    continue
                }
                else if ( auth.menteeId || auth.isSuperAdmin ) {
                    if (auth.menteeId == msg._id && auth.menteeId)      { msg.relationship = 'Your Mentee' }
                    else if ( msg.locationId )                          { msg.relationship = ( msg.location.name ? msg.location.name : msg.location[0].name )}
                    else if (msg.institutionId )                        { msg.relationship = ( msg.institution.name ? msg.institution.name : msg.institution[0].name )}
                    else if (msg.menteeId)                              { msg.relationship = 'Mentor' }
                    else                                                { msg.relationship = ( msg.address.city ? `${msg.address.city}, ${msg.address.stateCode}` : `${msg.address[0].city}, ${msg.address[0].stateCode}` ) } //author city
                    continue
                }
            }

            return msgs
        })
}

