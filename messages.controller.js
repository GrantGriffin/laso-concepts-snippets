(function (){
angular.module('client.site')
    .component('messages', {
        templateUrl: 'client/components/messages/messages-detail.html',
        controller: 'messagesComponentController as mc',
        bindings: {
            message: '<'
        }
    })

angular.module('client.site')
    .controller('messagesComponentController', MessagesComponentController)

MessagesComponentController.$inject = ['$uibModal', '$log', 'supportRequestsService', '$window', 'uiFeedbackService']

function MessagesComponentController ($uibModal, $log, supportRequestsService, $window, uiFeedbackService) {
    var vm = this
    vm.$onInit = _init;
    vm.flagModal = _flagModal
    vm.form = null
    
    function _init() {
        
    }

    function _flagModal() {
        $log.log('In Modal')
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'client/components/messages/modal/messages-support-request-modal.html',
            controller: 'messagesFlag as mf',
            size: 'md',
        })
        modalInstance.result
            .then(() => {
                var url = $window.location.origin + "/home/" + vm.message._id
                vm.form = {
                    subject: 'This message has been flagged for review',
                    content: 'Please review the message at this URL: ' + url
                }
                supportRequestsService.create(vm.form)
                .then(uiFeedbackService.success(`Message Successfully Flagged`, true).then((data) => { $log.log(data) }))
                .catch(err => console.log(err))
            })
            .catch(err => $log.log('error in modal', err))
    }
}
})();