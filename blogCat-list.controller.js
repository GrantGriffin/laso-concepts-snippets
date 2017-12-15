/* global angular */
(function () {
    'use strict'


    angular.module('client.crud').component('jsTreeComponent', {
        templateUrl: 'client/crud/blog-categories/list/blogCat-list.html',
        controller: 'blogCatListController as bLCtrl',
        bindings: {
            blogs: "<"
        }
    })

    angular.module('client.crud')
        .controller('blogCatListController', BlogCatListController)

    BlogCatListController.$inject = ['blogCatServFactory', '$state', '$log', 'uiFeedbackService', '$scope']

    function BlogCatListController(blogCatServFactory, $state, $log, uiFeedbackService, $scope) {

        var vm = this

        vm.thisBlogSearch = _thisBlogSearch

        // Modal 
        vm.openModal = _openModal;


        vm.$onInit = _init;
        function _init() {
            vm.formData = {}
            vm.flatArr = angular.copy(vm.blogs)  //separating display and data structure
            vm.data = buildTree(vm.flatArr)     //building tree from data copy
        }

        function _openModal(id, blog, nodeId) {
            $log.log('In Modal')
            uiFeedbackService.deleteModal(blog.name)
                .then(data => blogCatServFactory.delete(id))
                .then(data => {
                    vm.formData = null
                    uiFeedbackService.success(`Successfully deleted: ${blog.name}`, false)
                    $state.go('site.blogCat.list', {}, { reload: true })
                })
                .catch(data => $log.log(`Error: ${data}`))
        }

        function _thisBlogSearch() {
            if ($state.current.name === 'site.blogCat.list.edit') {
                return { _id: $state.params.id }
            } else {
                return
            }
        }

        //START jsTree
        function buildTree(flatArr) {

            let tree = [],
                output = {}

            for (let i = 0; i < flatArr.length; i++) {
                output[flatArr[i]._id] = flatArr[i]
                output[flatArr[i]._id].children = []
                output[flatArr[i]._id].text = output[flatArr[i]._id].name

                if (flatArr[i].parentCategoryId == null) {
                    tree.push(flatArr[i])
                }
            }

            for (let i = 0; i < flatArr.length; i++) {
                let parId = flatArr[i].parentCategoryId
                if (output[parId]) {
                    output[parId].children.push(flatArr[i])
                }
            }
            return tree
        }

        vm.treeConfig = {
            core: {
                multiple: false,
                animation: true,
                error: function (error) {
                    $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
                },
                check_callback: true,
                worker: true
            },
            types: {
                default: {
                    icon: "fa fa-folder text-warning fa-lg"
                },
                file: {
                    icon: "fa fa-file text-warning fa-lg"
                }
            },
            version: 1,
            plugins: ["sort", "contextmenu", "state", "types"],
            contextmenu: {
                items: customMenu
            }
        }

        function customMenu(node) {

            var items = {
                create: {
                    label: 'New',
                    icon: 'fa fa-plus text-success',
                    action: () => { $state.go('site.blogCat.create', { parentCategoryId: node.original._id }) }
                    //this is intended to set the id of the node created as parent Id to the child we're creating here
                },
                details: {
                    label: 'Details',
                    icon: 'fa fa-eye',
                    action: () => { $state.go('site.blogCat.detail', { id: node.original._id }) }
                },
                edit: {
                    label: 'Edit',
                    icon: 'fa fa-pencil',
                    action: () => { $state.go('site.blogCat.list.edit', { id: node.original._id }) }

                },
                delete: {
                    label: 'Delete',
                    icon: 'fa fa-times text-danger',
                    action: () => {_openModal(node.original._id, node.original)}
                }
            }
            return items
        }
        //END jsTree

    }

})();
