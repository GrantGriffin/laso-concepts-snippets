(function () {
    'use strict'

    angular.module('client.site')
        .controller('homeController', HomeController)

    HomeController.$inject = ['messageService', 'profileService', 'locationService', 'currentProfile', 'channels', '$state', '$log', 'uiFeedbackService', 'authenticationService', '$timeout', '$window']

    function HomeController(messageService, profileService, locationService, currentProfile, channels, $state, $log, uiFeedbackService, authenticationService, $timeout, $window) {
        let vm = this
        let cookie = null
        vm.messages = null
        vm.currentProfile = null
        vm.postData = null
        vm.selectedChannel = null
        vm.myChannels = null
        vm.employeeChannel = null
        vm.multipleLocationsCase = null

        vm.channelHeader = _channelHeader
        vm.postMessage = _postMessage

        vm.selectChannel = _selectChannel
        vm.selectLocationFromMultiple = _selectLocationFromMultiple

        vm.filterByInstitution = _filterByInstitution

        let channelObj = {}

        //check url state
        let institutionIdInUrl
        let locationIdInUrl
        let clientIdInUrl
        let employeeIdInUrl

        //Infinite scroll 
        let pageNum = 1
        vm.busy = true
        vm.loadMore = _loadMore
        //flot chart
        let metricsArray = []
        let dataArray = []
        let ticksArray = []
        vm.myChartOptions = {}
        vm.myData = []
        vm.showChart = false

        init()

        function init() {
            cookie = authenticationService.getCurrent()
            vm.currentProfile = currentProfile
            vm.myChannels = channels

            //flot chart
            if ($state.params.locationId) {
                locationService.readMetrics($state.params.locationId)
                    .then(metrics => {
                        vm.showChart = true
                        metricsArray = metrics

                        //create data and tick arrays for chart
                        dataArray = [[0], [1], [2], [3], [4], [5], [6]]
                        ticksArray = [[0], [1], [2], [3], [4], [5], [6]]
                        for (var i = 0; i < metricsArray.length; i++) {
                            dataArray[i].push(metricsArray[i][1])
                            ticksArray[i].push(metricsArray[i][0])
                        }

                        //set chart data
                        vm.myData = [{
                            data: dataArray,
                            label: "% of Live Clients",
                            color: '#727cb6',
                            lines: { show: true, fill: false, lineWidth: 2 },
                            points: { show: true, radius: 4, fillColor: '#fff' },
                            shadowSize: 0
                        }]

                        //set chart options
                        vm.myChartOptions = {
                            xaxis: { ticks: ticksArray, tickColor: '#ddd', tickSize: 2, axisLabel: "Date" },
                            yaxis: { tickColor: '#ddd', tickLength: 2, axisLabel: "% of Total Live Clients", tickSize: 20, axisLabelPadding: 5, min: 0 },
                            grid: {
                                hoverable: true,
                                clickable: true,
                                tickColor: "#ccc",
                                borderWidth: 1,
                                borderColor: '#ddd',
                            },
                            legend: {
                                labelBoxBorderColor: '#ddd',
                                margin: 0,
                                noColumns: 1,
                                show: true
                            }
                        }
                    })
            }

            vm.multipleLocationsCase = {
                activated: false
            }
            vm.postData = {
                tags: [],
                mentions: []
            }

            //counts institutions child locations
            let hashT = {}
            for (var i = 0; i < vm.myChannels.length; i++) {
                let inst = vm.myChannels[i].institutionId
                hashT[inst] = (hashT[inst] || 0) + 1;
            }
            for (var i = 0; i < vm.myChannels.length; i++) {
                vm.myChannels[i].count = hashT[vm.myChannels[i].institutionId]
            }

            // sets up channel array for the main dropdown selector 
            for (var j = 0; j < vm.myChannels.length; j++) {
                if (vm.myChannels[j].locationId) { vm.myChannels[j].name = "- " + vm.myChannels[j].name }
                if (vm.currentProfile.menteeId) { vm.myChannels[j].name = "Mentee Channel" }
                if (vm.myChannels[j].clientId && !vm.currentProfile.menteeId) { vm.myChannels[j].name = "My Team" }

                if (vm.currentProfile.institutionId || vm.currentProfile.locationId) {
                    var employeeChannel = {
                        name: vm.myChannels[0].name + " Employees",
                        employeeId: vm.myChannels[j].institutionId
                    }
                }
            }

            if (vm.currentProfile.institutionId || vm.currentProfile.locationId) { vm.myChannels.unshift(employeeChannel) }

            // this removes all institution objects from the multipleLocationCase secondary dropdown selector
            vm.locationChannels = angular.copy(channels)
            for (let i = 0; i < vm.locationChannels.length; i++) {
                if (vm.locationChannels[i].institutionId && !vm.locationChannels[i].locationId) {
                    vm.locationChannels.splice(i, 1)
                }
            }


            // checks if there is a channel id in the url and if there is, set the selector to it
            for (let item of vm.myChannels) {
                if ($state.params.institutionId) {
                    if (item.institutionId == $state.params.institutionId) {
                        vm.selectedChannel = item
                        break
                    }
                }
                else if ($state.params.locationId) {
                    if (item.locationId == $state.params.locationId) {
                        vm.selectedChannel = item;
                        break
                    }
                }
                else if ($state.params.clientId) {
                    if (item.clientId == $state.params.clientId) {
                        vm.selectedChannel = item;
                        break
                    }
                }
                else if ($state.params.employeeId) {
                    if (item.employeeId == $state.params.employeeId) {
                        vm.selectedChannel = item;
                        break
                    }
                }
            }
            
            if (vm.selectedChannel) { 
                _selectChannel()
                _readAll()
            } else if (cookie.profileType != 'super-admin') {
                //setting default channel
                vm.selectedChannel = vm.myChannels[0]
                _selectChannel()
            }
            
        }

        // main selector ng-change: this sets up the destination object of the message to be posted then it sets the url Params for the readAll
        function _selectChannel() {
            vm.multipleLocationsCase.activated = false
            if (vm.selectedChannel.employeeId) {
                vm.postData.destination = {
                    type: "employee",
                    id: vm.selectedChannel.employeeId
                }

            } else if (vm.selectedChannel.locationId) {

                vm.postData.destination = {
                    type: "location",
                    id: vm.selectedChannel.locationId
                }

            } else if (vm.selectedChannel.clientId) {

                vm.postData.destination = {
                    type: "client",
                    id: vm.selectedChannel.clientId
                }

            } else if (vm.selectedChannel.institutionId && !vm.selectedChannel.locationId) {

                if (cookie.profileType == "institution-admin") {
                    vm.postData.destination = {
                        type: "institution",
                        id: vm.selectedChannel.institutionId
                    }
                }
                else if (vm.selectedChannel.count >= 3) {
                    vm.multipleLocationsCase.activated = true
                }
                else {
                    // finds the locationId of a single location institution
                    let channelObject = vm.myChannels.find(channel => {
                        if ((channel.locationId) && (channel.institutionId === vm.selectedChannel.institutionId)) {
                            return channel
                        }
                    })
                    vm.postData.destination = {
                        type: "location",
                        id: channelObject.locationId
                    }
                }
            }

            _setUrlState()

        }

        // sets url params for the readAll
        function _setUrlState() {
            let idType = ''
            for (let item of vm.myChannels) {
                if (item.name === vm.selectedChannel.name) {
                    channelObj = vm.selectedChannel
                    if (channelObj.institutionId) { idType = 'institutionId' }
                    if (channelObj.locationId && item.institutionId) { idType = 'locationId' }
                    if (channelObj.clientId) { idType = 'clientId' }
                    if (channelObj.employeeId) { idType = 'employeeId' }
                    let params = { [idType]: channelObj[idType] ? channelObj[idType] : channelObj.id }
                    if ($state.params.q) {
                        params.q = $state.params.q
                    }
                    $state.go('site.home', params, { inherit: false })

                }
            }
        }

        //shows only child locations to the secondary dropdown
        function _filterByInstitution() {
            if (vm.multipleLocationsCase.activated == true) {
                return vm.selectedChannel.institutionId
            }
        }

        //ng-change of the secondary dropdown: if there is more than one child location, this will set the final message destination
        function _selectLocationFromMultiple() {
            vm.postData.destination = {
                type: "location",
                id: vm.multipleLocationsCase.destinationObj.locationId
            }
        }

        function _readAll() {
            let messages

            _checkUrlState()

            //passing q in url to mongo
            if ($state.params.institutionId || $state.params.locationId || $state.params.clientId || $state.params.employeeId || vm.currentProfile.isSuperAdmin || $state.params.q) {
                messageService.readAll(null, institutionIdInUrl, clientIdInUrl, employeeIdInUrl, locationIdInUrl, vm.currentProfile.isSuperAdmin, null, $state.params.q)
                    .then((data) => {
                        messages = data.items.messages
                        vm.messages = messages
                        for (let i = 0; i < messages.length; i++) {
                            if (messages[i].content.includes("#") || (messages[i].content.includes("@"))) {
                                let url = $window.location.pathname.replace(/\/+$/, '')
                                let fullUrl
                                if ($state.params.institutionId) {
                                    fullUrl = url + '?' + 'institutionId=' + $state.params.institutionId
                                }
                                if ($state.params.locationId) {
                                    fullUrl = url + '?' + 'locationId=' + $state.params.locationId
                                }
                                if ($state.params.clientId) {
                                    fullUrl = url + '?' + 'clientId=' + $state.params.clientId
                                }
                                if ($state.params.employeeId) {
                                    fullUrl = url + '?' + 'employeeId=' + $state.params.employeeId
                                }
                                if (vm.currentProfile.isSuperAdmin) {
                                    fullUrl = url + '?'
                                }
                                console.log(fullUrl)
                                messages[i].content = messages[i].content.replace(/(^|\s)[#]([a-z\d-]+)/ig, (`$1 <a class='laso-tag' href='${fullUrl}&q=%23$2'> #$2 </a>`)).replace(/(^|\s)[@]([a-z\d-]+)/ig, (`$1 <a class='laso-mention' href='${fullUrl}&q=%40$2'> @$2 </a>`))
                            }
                        }
                        loadRelationships()
                        vm.busy = false  //fix infinite scroll 12-11-17
                    })
            } else {
                $log.log('No channel selected')
            }

        }

        //scrolling function invoked when scroll reaches end of div. should GET next 20 messages and append to main messages array. 
        function _loadMore() {
            let messages = []
            pageNum++
            vm.busy = true
            _checkUrlState()

            if ($state.params.institutionId || $state.params.locationId || $state.params.clientId || $state.params.employeeId || vm.currentProfile.isSuperAdmin || $state.params.q) {
                messageService.readAll(pageNum, institutionIdInUrl, clientIdInUrl, employeeIdInUrl, locationIdInUrl, vm.currentProfile.isSuperAdmin, null, $state.params.q)
                    .then((data) => {

                        messages = data.items.messages
                        for (let message of messages) {
                            if (message.length === 0) {
                                vm.busy = true
                                break
                            }
                            vm.messages.push(message)
                            vm.busy = false
                        }
                        for (let i = 0; i < messages.length; i++) {
                            if (messages[i].content.includes("#") || (messages[i].content.includes("@"))) {
                                let url = $window.location.pathname.replace(/\/+$/, '')
                                let fullUrl
                                if ($state.params.institutionId) {
                                    fullUrl = url + '?' + 'institutionId=' + $state.params.institutionId
                                }
                                if ($state.params.locationId) {
                                    fullUrl = url + '?' + 'locationId=' + $state.params.locationId
                                }
                                if ($state.params.clientId) {
                                    fullUrl = url + '?' + 'clientId=' + $state.params.clientId
                                }
                                if ($state.params.employeeId) {
                                    fullUrl = url + '?' + 'employeeId=' + $state.params.employeeId
                                }
                                if (vm.currentProfile.isSuperAdmin) {
                                    fullUrl = url + '?'
                                }
                                console.log(fullUrl)
                                messages[i].content = messages[i].content.replace(/(^|\s)[#]([a-z\d-]+)/ig, (`$1 <a class='laso-tag' href='${fullUrl}&q=%23$2'> #$2 </a>`)).replace(/(^|\s)[@]([a-z\d-]+)/ig, (`$1 <a class='laso-mention' href='${fullUrl}&q=%40$2'> @$2 </a>`))
                            }
                        }
                    })
            }
            loadRelationships()
        }

        function _checkUrlState() {
            if ($state.params.institutionId) { institutionIdInUrl = $state.params.institutionId }
            if ($state.params.locationId) { locationIdInUrl = $state.params.locationId }
            if ($state.params.clientId) { clientIdInUrl = $state.params.clientId }
            if ($state.params.employeeId) { employeeIdInUrl = $state.params.employeeId }
        }

        function _postMessage() {
            messageService.create(vm.postData)
                .then(response => {
                    //to show the new message this sets up a dom element to mirror what is sent to the backend
                    vm.postData.dateCreated = new Date()
                    vm.postData.profile = {}
                    vm.postData.profile.profileOverrides = {
                        name: vm.currentProfile.profileOverrides.name ? vm.currentProfile.profileOverrides.name : vm.currentProfile.user.defaultDisplayName,

                        imageUrl: vm.currentProfile.profileOverrides.imageUrl ? vm.currentProfile.profileOverrides.imageUrl : vm.currentProfile.user.defaultImageUrl,
                    }
                    if (vm.postData.content.includes("#") || (vm.postData.content.includes("@"))) {
                        vm.postData.content = vm.postData.content.replace(/(^|\s)([#][a-z\d-]+)/ig, ("$1 <a class='laso-tag'> $2 </a>")).replace(/(^|\s)([@][a-z\d-]+)/ig, ("$1 <a class='laso-mention'> $2 </a>"))
                    }
                    vm.messages.push(vm.postData)
                    vm.postData = {
                        destination: vm.postData.destination
                    }
                    uiFeedbackService.success(`Your message has been posted to ${vm.selectedChannel.name}.`)
                })
                .catch(response => {
                    $log.log(response, "post message error")
                    let message = response.details[0].message ? response.details[0].message : response.name
                    uiFeedbackService.error(`error: ${message}`, true)
                })
        }

        function _channelHeader() {
            let obj = vm.selectedChannel
            let name = null
            if (obj) {
                name = obj.name.replace('- ', '')
                if ((obj.institutionId && obj.locationId) || (obj.institutionId && !obj.locationId)) { return `${name} Client Channel` }
                if (obj.employeeId) { return `${name} Employee Channel` }
                if (!obj.employeeId && !obj.institutionId && obj.clientId) { return `${name}'s Channel` }
            }
            else {
                return "All Messages"
            }
        }

        function loadRelationships() {
            let profiles = []
            for (let i = 0; i < vm.messages.length; i++) {
                profiles.push(vm.messages[i].profileId)
            }

            profiles = profiles.filter((item, index, inputArray) => inputArray.indexOf(item) == index)

            messageService.getRelationships(profiles)
                .then(rel => {
                    let relationships = {}

                    for (let i = 0; i < rel.items.length; i++) {
                        relationships[rel.items[i]._id] = rel.items[i].relationship
                    }

                    for (var i = 0; i < vm.messages.length; i++) {
                        vm.messages[i].relationship = relationships[vm.messages[i].profileId]
                    }
                })
        }
    }
})();