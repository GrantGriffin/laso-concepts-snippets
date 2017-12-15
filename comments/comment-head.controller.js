(function() {
    'use strict'

    angular.module('client.crud')
        .controller('commentHeadController', CommentHeadController)

    CommentHeadController.$inject = ['$log', '$state']

    function CommentHeadController($log, $state) {
        var vm = this
        vm.tagline = null
        vm.disable  = _disable

        init()

        function init() {
            vm.tagline = "Comments"
        }

        function _disable() {
            if($state.current.name == 'site.comments.list.edit' || $state.current.name == 'site.comments.create') {
                return true
            } else {
                return false
            }
        }

    }

})()