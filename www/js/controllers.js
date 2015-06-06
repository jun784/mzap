angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('RegisterCtrl', function($scope) {})

.controller('TroubleCtrl', function($scope, $state) {
  $scope.trouble = function() {
    $state.go('tab.chats');
  }
})

.controller('OfferCtrl', function($scope, $state) {
  $scope.sessionStart = function() {
    $state.go('app.login', {
      contactName: "hoge"
    })
  }
})

.controller('ConsultantsCtrl', function($scope) {})

.controller('CalendarCtrl', function($scope, $state, uiCalendarConfig) {
  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();
  
  $scope.events = [
    // {title: 'All Day Event',start: new Date(y, m, 1)},
    // {title: 'Long Event',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
    {id: 999,title: 'Repeating Event',start: new Date(y, m, d - 3, 16, 0),allDay: false},
    {id: 999,title: 'Repeating Event',start: new Date(y, m, d + 4, 16, 0),allDay: false},
    {title: 'Birthday Party',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
    {title: 'Click for Google',start: new Date(y, m, 28),end: new Date(y, m, 29),url: 'http://google.com/'}
  ];

  $scope.eventSource = {
    // url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
    className: 'gcal-event',           // an option!
    currentTimezone: 'America/Chicago' // an option!
  };

  $scope.eventSources = [$scope.events];

  $scope.goOffer = function() {
    $state.go('app.offer');
  }

  $scope.uiConfig = {
    calendar: {
      height: 450,
      editable: true,
      header:{
        left: 'agendaWeek agendaDay',
        center: 'title',
        right: 'today prev,next'
      },
      // dayClick: $scope.alertEventOnClick,
      eventClick: $scope.goOffer,
      eventDrop: $scope.alertOnDrop,
      eventResize: $scope.alertOnResize
    }
  };
})

.controller('ChatsCtrl', function($scope, Consultants) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  
  $scope.consultants = Consultants.all();
  $scope.remove = function(consultant) {
    Consultants.remove(consultant);
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Consultants) {
  $scope.consultant = Consultants.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('ContactsCtrl', function ($scope, ContactsService) {
  $scope.contacts = ContactsService.onlineUsers;
})

.controller('LoginCtrl', function ($scope, $state, $ionicPopup, signaling, ContactsService) {
  $scope.data = {};
  $scope.loading = false;

  $scope.login = function () {
    $scope.loading = true;
    signaling.emit('login', $scope.data.name);
  };

  signaling.on('login_error', function (message) {
    $scope.loading = false;
    var alertPopup = $ionicPopup.alert({
      title: 'Error',
      template: message
    });
  });

  signaling.on('login_successful', function (users) {
    ContactsService.setOnlineUsers(users, $scope.data.name);
    $state.go('app.contacts');
  });
})

.controller('CallCtrl', function ($scope, $state, $rootScope, $timeout, $ionicModal, $stateParams, signaling, ContactsService) {
  var duplicateMessages = [];

  $scope.callInProgress = false;

  $scope.isCalling = $stateParams.isCalling === 'true';
  $scope.contactName = $stateParams.contactName;

  $scope.allContacts = ContactsService.onlineUsers;
  $scope.contacts = {};
  $scope.hideFromContactList = [$scope.contactName];
  $scope.muted = false;

  $ionicModal.fromTemplateUrl('templates/select_contact.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.selectContactModal = modal;
  });

  function call(isInitiator, contactName) {
    console.log(new Date().toString() + ': calling to ' + contactName + ', isInitiator: ' + isInitiator);

    var config = { 
      isInitiator: isInitiator,
      turn: {
        host: 'turn:ec2-54-68-238-149.us-west-2.compute.amazonaws.com:3478',
        username: 'test',
        password: 'test'
      },
      streams: {
        audio: true,
        video: true
      }
    };

    var session = new cordova.plugins.phonertc.Session(config);
    
    session.on('sendMessage', function (data) { 
      signaling.emit('sendMessage', contactName, { 
        type: 'phonertc_handshake',
        data: JSON.stringify(data)
      });
    });

    session.on('answer', function () {
      console.log('Answered!');
    });

    session.on('disconnect', function () {
      if ($scope.contacts[contactName]) {
        delete $scope.contacts[contactName];
      }

      if (Object.keys($scope.contacts).length === 0) {
        signaling.emit('sendMessage', contactName, { type: 'ignore' });
        $state.go('app.contacts');
      }
    });

    session.call();

    $scope.contacts[contactName] = session; 
  }

  if ($scope.isCalling) {
    signaling.emit('sendMessage', $stateParams.contactName, { type: 'call' });
  }

  $scope.ignore = function () {
    var contactNames = Object.keys($scope.contacts);
    if (contactNames.length > 0) { 
      $scope.contacts[contactNames[0]].disconnect();
    } else {
      signaling.emit('sendMessage', $stateParams.contactName, { type: 'ignore' });
      $state.go('app.contacts');
    }
  };

  $scope.end = function () {
    Object.keys($scope.contacts).forEach(function (contact) {
      $scope.contacts[contact].close();
      delete $scope.contacts[contact];
    });
  };

  $scope.answer = function () {
    if ($scope.callInProgress) { return; }

    $scope.callInProgress = true;
    $timeout($scope.updateVideoPosition, 1000);

    call(false, $stateParams.contactName);

    setTimeout(function () {
      console.log('sending answer');
      signaling.emit('sendMessage', $stateParams.contactName, { type: 'answer' });
    }, 1500);
  };

  $scope.updateVideoPosition = function () {
    $rootScope.$broadcast('videoView.updatePosition');
  };

  $scope.openSelectContactModal = function () {
    cordova.plugins.phonertc.hideVideoView();
    $scope.selectContactModal.show();
  };

  $scope.closeSelectContactModal = function () {
    cordova.plugins.phonertc.showVideoView();
    $scope.selectContactModal.hide();      
  };

  $scope.addContact = function (newContact) {
    $scope.hideFromContactList.push(newContact);
    signaling.emit('sendMessage', newContact, { type: 'call' });

    cordova.plugins.phonertc.showVideoView();
    $scope.selectContactModal.hide();
  };

  $scope.hideCurrentUsers = function () {
    return function (item) {
      return $scope.hideFromContactList.indexOf(item) === -1;
    };
  };

  $scope.toggleMute = function () {
    $scope.muted = !$scope.muted;

    Object.keys($scope.contacts).forEach(function (contact) {
      var session = $scope.contacts[contact];
      session.streams.audio = !$scope.muted;
      session.renegotiate();
    });
  };

  function onMessageReceive (name, message) {
    switch (message.type) {
      case 'answer':
        $scope.$apply(function () {
          $scope.callInProgress = true;
          $timeout($scope.updateVideoPosition, 1000);
        });

        var existingContacts = Object.keys($scope.contacts);
        if (existingContacts.length !== 0) {
          signaling.emit('sendMessage', name, {
            type: 'add_to_group',
            contacts: existingContacts,
            isInitiator: false
          });
        }

        call(true, name);
        break;

      case 'ignore':
        var len = Object.keys($scope.contacts).length;
        if (len > 0) { 
          if ($scope.contacts[name]) {
            $scope.contacts[name].close();
            delete $scope.contacts[name];
          }

          var i = $scope.hideFromContactList.indexOf(name);
          if (i > -1) {
            $scope.hideFromContactList.splice(i, 1);
          }

          if (Object.keys($scope.contacts).length === 0) {
            $state.go('app.contacts');
          }
        } else {
          $state.go('app.contacts');
        }

        break;

      case 'phonertc_handshake':
        if (duplicateMessages.indexOf(message.data) === -1) {
          $scope.contacts[name].receiveMessage(JSON.parse(message.data));
          duplicateMessages.push(message.data);
        }
        
        break;

      case 'add_to_group':
        message.contacts.forEach(function (contact) {
          $scope.hideFromContactList.push(contact);
          call(message.isInitiator, contact);

          if (!message.isInitiator) {
            $timeout(function () {
              signaling.emit('sendMessage', contact, { 
                type: 'add_to_group',
                contacts: [ContactsService.currentName],
                isInitiator: true
              });
            }, 1500);
          }
        });

        break;
    } 
  }

  signaling.on('messageReceived', onMessageReceive);

  $scope.$on('$destroy', function() { 
    signaling.removeListener('messageReceived', onMessageReceive);
  });
});