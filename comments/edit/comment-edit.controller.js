(function() {
    'use strict'

    angular.module('client.crud')
        .controller('commentEditController', CommentEditController)

        CommentEditController.$inject = ['commentService', 'comment', '$state', '$window']

        function CommentEditController(commentService, comment, $state, $window) {

            var vm = this
            vm.tagline = null
            vm.submitText = null
            vm.reset = _reset
            vm.submit = _submit
            vm.validate = _validate
            vm.validateHex = _validateHex
            vm.new = {
                content:""
                , subject: {
                    type:"Blog Article"
                    ,id:""
                }
            }
            
            init()

            function init() {
                if($state.current.name === 'site.comments.list.edit') {
                    vm.comment = angular.copy(comment)
                    vm.backup = angular.copy(comment)
                    vm.tagline = "Update"
                    vm.submitText = "Update"
                } else {
                    vm.comment = angular.copy(vm.new)
                    vm.tagline = "Create"
                    vm.submitText = "Create"
                }
            }

            function _reset() {
                if($state.current.name === 'site.comments.list.edit') {
                    vm.comment = angular.copy(vm.backup)
                } else {
                    vm.comment = angular.copy(vm.new)
                }
            }

            function _submit() {
                if($state.current.name === 'site.comments.list.edit') {
                    commentService.update(vm.comment)
                        .then(data => {
                            $window.alert("Update successful.")
                            $state.go('site.comments.list', null, {reload: true})
                        })
                } else {
                    commentService.create(vm.comment)
                        .then(data => {
                            $window.alert("Creation successful.")
                            $state.go('site.comments.list')
                        })
                }
            }

            function _validate(object) {
               if(object.$touched && object.$invalid)
                    return true
            }

            function _validateHex(object) {
                let validHex = /^([0-9a-fA-F]{24})$/
               if(!validHex.test(object.$modelValue) && object.$touched)
                return true
            }

        }
})()