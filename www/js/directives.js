angular.module('starter.directives', [])

  .factory('ContactsService', function (signaling) {
    var onlineUsers = [];

    signaling.on('online', function (name) {
      if (onlineUsers.indexOf(name) === -1) {
        onlineUsers.push(name);
      }
    });

    signaling.on('offline', function (name) {
      var index = onlineUsers.indexOf(name);
      if (index !== -1) {
        onlineUsers.splice(index, 1);
      }
    });

    return {
      onlineUsers: onlineUsers,
      setOnlineUsers: function (users, currentName) {
        this.currentName = currentName;
        
        onlineUsers.length = 0;
        users.forEach(function (user) {
          if (user !== currentName) {
            onlineUsers.push(user);
          }
        });
      }
    }
  })

  .directive('videoView', function ($rootScope, $timeout) {
    return {
      restrict: 'E',
      template: '<div class="video-container"></div>',
      replace: true,
      link: function (scope, element, attrs) {
        function updatePosition() {
          cordova.plugins.phonertc.setVideoView({
            container: element[0],
            local: { 
              position: [240, 240],
              size: [50, 50]
            }
          });
        }

        $timeout(updatePosition, 500);
        $rootScope.$on('videoView.updatePosition', updatePosition);
      }
    }
  });