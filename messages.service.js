(function () {
    'use strict'

    angular.module('client.services').factory('messageService', MessageServiceFactory)

    MessageServiceFactory.$inject = ['$http', '$q']

    function MessageServiceFactory($http, $q) {
        return {
            readAll: readAll,
            readyById: readyById,
            readMyChannels: readMyChannels,
            create: create,
            update: update,
            delete: _delete,
            getRelationships: getRelationships
        }

        function readAll(page, institutionId, clientId, employerId, locationId, isSuperAdmin, senderProfileId, q) {
            let queryParams = {}
            if (institutionId) { queryParams.institutionId = institutionId }
            else if (employerId) { queryParams.employerId = employerId }
            else if (clientId) { queryParams.clientId = clientId }
            else if (locationId) { queryParams.locationId = locationId }
            else if (senderProfileId) { queryParams.senderProfileId = senderProfileId }
            if (q) { queryParams.q = q }
            if (page) { queryParams.page = page }
            return $http.get('/api/messages', { params: queryParams })
                .then(dateChange => convertAllDates(dateChange))
                .catch(onError)
        }

        function readyById(id) {
            return $http.get(`/api/messages/${id}`)
                .then(dateChange => convertDate(dateChange))
                .catch(onError)
        }

        function readMyChannels() {
            return $http.get('/api/messages/my-channels')
                .then(dateChange => convertDate(dateChange))
                .catch(onError)
        }

        function create(messageData) {
            return $http.post('/api/messages', messageData)
                .then(xhrSuccess)
                .catch(onError)
        }

        function update(messageData) {
            return $http.put(`/api/messages/${messageData._id}`, messageData)
                .then(xhrSuccess)
                .catch(onError)
        }

        function _delete(id) {
            return $http.delete(`/api/messages/${id}`)
                .then(xhrSuccess)
                .catch(onError)
        }

        function xhrSuccess(response) {
            return response.data
        }

        function convertAllDates(dateChange) {
            for (let x = 0; x < dateChange.data.items.messages.length; x++) {
                dateChange.data.items.messages[x].dateCreated = new Date(dateChange.data.items.messages[x].dateCreated)
                dateChange.data.items.messages[x].dateModified = new Date(dateChange.data.items.messages[x].dateModified)
                if (dateChange.data.items.messages[x].dateDeactivated !== null) {
                    dateChange.data.items.messages[x].dateDeactivated = new Date(dateChange.data.items.messages[x].dateDeactivated)
                }
            }

            return dateChange.data
        }

        function convertDate(dateChange) {
            dateChange.data.item.dateCreated = new Date(dateChange.data.item.dateCreated)
            dateChange.data.item.dateModified = new Date(dateChange.data.item.dateModified)
            if (dateChange.data.item.dateDeactivated !== null) {
                dateChange.data.item.dateDeactivated = new Date(dateChange.data.item.dateDeactivated)
            }
            return dateChange.data
        }

        function onError(error) {
            console.log(error.data)
            return $q.reject(error.data)
        }

        function getRelationships(msgs) {
            return $http.post('/api/relationships', msgs)
                .then(xhrSuccess)
                .catch(onError)
        }
    }
})();
