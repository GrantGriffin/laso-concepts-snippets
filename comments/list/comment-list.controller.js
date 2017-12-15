(function () {
    'use strict'

    angular.module('client.crud')
        .controller('commentListController', CommentListController)

    CommentListController.$inject = ['commentService', 'comments', '$log', '$state', 'uiFeedbackService']

    function CommentListController(commentService, comments, $log, $state, uiFeedbackService) {
        var vm = this

        vm.formData = null
        vm.comments = null
        vm.currentId = $state.params.id
        vm.update = _update
        vm.delete = _delete
        vm.listFilter = _listFilter
        //START delete modal settings
        vm.openModal = _openModal

        vm.status = {
            isFirstOpen: true
            , isFirstDisabled: false
        }
        //END delete modal settings

        init()

        function init() {
            vm.formData = {}
            vm.comments = angular.copy(comments)
        }

        //START modal functions

        function _openModal(item, itemDesc) {
            uiFeedbackService.deleteModal(itemDesc)
                .then(() => commentService.delete(item._id))
                .then(() => $state.go('site.comments.list', {}, { reload: true }))
                .then(() => uiFeedbackService.success(`You have Successfully Deleted ${itemDesc}`, true))
                .catch(() => { $log.log('Modal dismissed at: ' + new Date()) })
        }

        //END modal functions

        function _listFilter() {
            if ($state.current.name === 'site.comments.list.edit') {
                return { _id: $state.params.id }
            } else {
                return
            }
        }

        function _create() {
            commentService.create(vm.formData)
                .then(data => {
                    vm.formData._id = data.item
                    vm.comments.push(vm.formData)
                    vm.formData = null
                })
                .catch(data => $log.log(`Error: ${data.errors}`))
        }

        function _update() {
            commentService.update(vm.formData)
                .then(data => vm.formData = null)
                .catch(data => $log.log(`Error: ${data.errors}`))
        }

        function _delete(id) {
            commentService.delete(id)
                .then(data => {
                    vm.formData = null
                    let removeIndex = vm.comments.findIndex(element => element._id === id)
                    vm.comments.splice(removeIndex, 1)
                })
                .catch(data => $log.log(`Error: ${data.errors}`))
        }
    }
})()