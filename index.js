
const router = require('express').Router()
const addressesRoutes = require('./addresses.routes')
const blogArticleRoutes = require('./blog-articles.routes')
const blogCatsRoutes = require('./blog-categories.routes')
const clientNotesRoutes = require('./client-notes.routes')
const commentsRoutes = require('./comments.routes')
const emailsRoutes = require('./emails.routes')
const faqCategoriesRoutes = require('./faq-categories.routes')
const faqEntriesRoutes = require('./faq-entries.routes')
const fileTestRoutes = require('./files.routes')
const hackersRoutes = require('./hackers.routes')
const institutionsRoutes = require('./institutions.routes')
const locationsRoutes = require('./locations.routes')
const messageRoutes = require('./messages.routes')
const authenticate = require('../filters/authenticate')
const usersRoutes = require('./users.routes')
const profileRoutes = require('./profiles.routes')
const notificationsRoutes = require('./notifications.routes')
const pagesRoutes = require('./pages.routes.js')
const calendarEventsRoutes = require('./calendar-events.routes')
const pageSectionTemplatesRoutes = require('./page-section-templates.routes')
const supportRequestsRoutes = require('./support-requests.routes')
const clientRoutes = require('./client.routes')
const relationshipRoutes = require('./relationships.routes')

module.exports = router;

router.use(authenticate)

// API routes (group routing modules here - no empty lines between)
router.use('/api/addresses', addressesRoutes)
router.use('/api/blog-articles', blogArticleRoutes)
router.use('/api/blog-categories', blogCatsRoutes)
router.use('/api/calendar-events', calendarEventsRoutes)
router.use('/api/client-notes', clientNotesRoutes)
router.use('/api/emails', emailsRoutes)
router.use('/api/faq-categories', faqCategoriesRoutes)
router.use('/api/faq-entries', faqEntriesRoutes)
router.use('/api/files/', fileTestRoutes)
router.use('/api/hackers', hackersRoutes)
router.use('/api/institutions', institutionsRoutes)
router.use('/api/locations', locationsRoutes)
router.use('/api/messages', messageRoutes)
router.use('/api/notifications', notificationsRoutes)
router.use('/api/comments', commentsRoutes)
router.use('/api/pages', pagesRoutes)
router.use('/api/page-section-templates', pageSectionTemplatesRoutes)
router.use('/api/profiles', profileRoutes) 
router.use('/api/support-requests', supportRequestsRoutes)
router.use('/api/users', usersRoutes)
router.use('/api/relationships', relationshipRoutes)




// API error handlers (API routes must be registered before this)
useAPIErrorHandlers(router)
router.use(clientRoutes)
function useAPIErrorHandlers(router) {
    // Handle API 404
    router.use('/api/*', (req, res, next) => {
        res.sendStatus(404)
    })

    // Handle API 500
    router.use((err, req, res, next) => {
        // If the error object doesn't exists
        if (!err) {
            return next()
        }

        // Log it
        console.error(err.stack)

        // Redirect to error page
        res.sendStatus(500)
    })
}
