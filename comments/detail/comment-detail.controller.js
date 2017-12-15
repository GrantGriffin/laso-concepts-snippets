(function () {
    'use strict'

    angular.module('client.crud')
        .controller('commentDetailController', CommentDetailController)

    CommentDetailController.$inject = ['commentService', 'comment', '$stateParams', 'uiFeedbackService', '$state', '$log']

    function CommentDetailController(commentService, comment, $stateParams, uiFeedbackService, $state, $log) {
        var vm = this
        vm.tagline = null
        vm.commentId = $state.params.id
        vm.comment = null

        //START delete modal settings
        vm.openModal = _openModal

        vm.status = {
            isFirstOpen: true
            , isFirstDisabled: false
        }
        //END delete modal settings

        init()

        function init() {
            vm.tagline = "Comment Detail"
            vm.comment = comment
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
        

    }
})()