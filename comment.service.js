(function () {
    'use strict'

    angular.module('client.services')
        .factory('commentService', CommentServiceFactory)

    CommentServiceFactory.$inject = ['$http', '$q']

    function CommentServiceFactory($http, $q) {
        return {
            readAll: readAll
            , readById: readById
            , create: create
            , update: update
            , delete: _delete
        }

        function readAll() {
            return $http.get('/api/comments')
                .then(dateChange =>
                    convertAllDates(dateChange)
                )
                .catch(onError)
        }

        function readById(id) {
            return $http.get(`/api/comments/${id}`)
                .then(dateChange =>
                    convertDate(dateChange)
                )
                .catch(onError)
        }

        function create(commentData) {
            return $http.post('/api/comments', commentData)
                .then(xhrSuccess)
                .catch(onError)
        }

        function update(commentData) {
            return $http.put(`/api/comments/${commentData._id}`, commentData)
                .then(xhrSuccess)
                .catch(onError)
        }

        function _delete(id) {
            return $http.delete(`/api/comments/${id}`)
                .then(xhrSuccess)
                .catch(onError)
        }

        function xhrSuccess(response) {
            return response.data
        }

        function convertAllDates(dateChange){
            for (let x = 0; x < dateChange.data.length; x++) {
                dateChange.data[x].dateCreated = new Date(dateChange.data[x].dateCreated)
                dateChange.data[x].dateModified = new Date(dateChange.data[x].dateModified)
                dateChange.data[x].birthDate = new Date(dateChange.data[x].birthdate)
                if (dateChange.data[x].dateDeactivated !== null) {
                    dateChange.data[x].dateDeactivated = new Date(dateChange.data[x].dateDeactivated)
                }
                
            }
            return dateChange.data   
        }

        function convertDate(dateChange){
            dateChange.data.dateCreated = new Date(dateChange.data.dateCreated)
            dateChange.data.dateModified = new Date(dateChange.data.dateModified)
            dateChange.data.birthDate = new Date(dateChange.data.birthdate)
            if (dateChange.data.dateDeactivated !== null) {
                dateChange.data.dateDeactivated = new Date(dateChange.data.dateDeactivated)
            }
            return dateChange.data
        }

        function onError(error) {
            console.log(error.data)
            return $q.reject(error.data)
        }
    }
})()