// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
// angular.module('starter', ['ionic', 'starter.controllers'])
var firebaseUrl = "https://marine.firebaseio.com";



angular.module('starter', ['ionic', 'starter.controllers', 'ngResource', 'firebase',
    //'ionic-material'
    'youtube-embed',
    'oblador.lazytube',
    'flickrServices',
    'ion-gallery',
    'LocalStorageModule',
    'ion-fab-button',
    'firebaseService',
    'ionic-toast'
  ])
  .config(function($httpProvider) {
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  })
  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })

.run(function($rootScope, $location, $state, userService, $ionicModal, Auth, userService, firebaseService, ionicToast) {

    var $scope = $rootScope;
    $scope.loginModalReady = $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $rootScope
    }).then(function(modal) {
      $rootScope.modal = modal;
    });

    // Login an existing user, called when a user submits the login form
    $scope.login = function(user) {
      //$scope.saveCache('loginData', user);
      Auth.$authWithPassword({
        email: user.email,
        password: user.password
      }).then(function(authData) {
        console.log('Logged in successfully as: ', authData.uid);
        $scope.loggedInUser = authData;
        $scope.closeLogin();
        if ($scope.toState) {
          $state.go($scope.toState.name);
          $scope.toState = null;
        }

      }).catch(function(error) {
        console.log('Error: ', error);
        //$scope.closeLogin();

      });
      console.log('Doing login', $scope.loginData);


    };

    // Log a user out
    $scope.logout = function() {
      Auth.$unauth();
    };
    // Triggered in the login modal to close it
    $rootScope.closeLogin = function() {
      $rootScope.modal.hide();
    };

    // Open the login modal
    $rootScope.openLogin = function() {
      console.log("$scope.loginModalReady:", $scope.loginModalReady);
      if (!Auth.$getAuth()) {
        $scope.loginModalReady.then(function() {
          $rootScope.modal.show();
        });

      } else {
        ionicToast.show('logged in alreay', 'bottom', false, 3000);
        console.log("openLogin() alrealy logged in as ", $rootScope.loggedInUser);
      }
    };
    // Check for the user's authentication state
    Auth.$onAuth(function(authData) {
      var state = $state.current;

      console.log("Auth.$onAuth()", authData, state);
      if (authData) {
        $scope.loggedInUser = authData;
        // var ref = new Firebase(FBURL + "users/" + authData.uid);
        // //$scope.searchHistory = $firebaseObject(ref.child("searchHistory")); //Fire.child("searchHistory").child(authData.uid);
        // $scope.lifeBook = $firebaseObject(ref.child("lifes")); //Fire.child("searchHistory").child(authData.uid);
        //
        // LifeCloud.test();
        //var lifeCloud = LifeCloud.init();
        var lifeCloud = firebaseService.initObject('life');
        lifeCloud.$bindTo($scope, "myItems");
        firebaseService.initObject('searchHistory').$bindTo($scope, "searchHistory");
        //$scope.searchHistory = firebaseService.initObject('searchHistory'); //Fire.child("searchHistory").child(authData.uid);

        // $scope.searchHistory = $firebaseObject(new Firebase(FBURL + "users/" + authData.uid +   "/searchHistory" )); //Fire.child("searchHistory").child(authData.uid);
      } else {
        $scope.loggedInUser = null;
        if (state && state.name && state.name.includes('user')) {
        // if ($state.includes("user")) {
          $state.go("app.search");
        }

      }
    });
    $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {

      console.log('$stateChangeStart', toState, toParams, userService.user());

      //var isLogin = toState.name === "login";
      if (!toState.name.includes("user")) {
        return; // no need to redirect
      }

      // now, redirect only not authenticated

      var userInfo = userService.user();

      if (!userInfo) {
        e.preventDefault(); // stop current execution
        // $state.go('login'); // go to login
        $rootScope.toState = toState;
        $rootScope.toParams = toParams;

        $rootScope.openLogin();
      }
    });

  })
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })

    .state('app.search', {
        url: '/search',
        views: {
          'menuContent': {
            templateUrl: 'templates/search.html',
            controller: 'SearchCtrl'

          }
        }
      })
      .state('app.detail', {
        url: '/detail/:key?eol&gbif',
        views: {
          'menuContent': {
            templateUrl: 'templates/detail.html',
            // controller: 'SearchCtrl'
            controller: 'DetailCtrl'
          }
        },
        resolve: {
          key: function($stateParams) {
            console.log($stateParams);
            return $stateParams.key;
          },
          eolId: function($stateParams) {
            return $stateParams.eol;
          },
          gbifId: function($stateParams) {
            return $stateParams.gbif;
          },
          // item: function($stateParams, searchService) {
          //   // console.log($stateParams, $scope)
          //   return searchService.get($stateParams.key);
          // },
          // tasks: function(TaskService, user) {
          //   return user.canHaveTasks() ?
          //     TaskService.find(user.id) : [];
          // }
        },
        onEnter: function(searchService) {
          //if(title){ ... do something ... }
          console.log("app.detail onEnter", searchService.get("test"));
        },
      })
      .state('app.browse', {
        url: '/browse',

        views: {
          'menuContent': {
            templateUrl: 'templates/browse.html',
            controller: 'GalleryCtrl'

          }
        }
      })
      .state('app.user', {
        url: '/user',
        abstract: true,
        views: {
          'menuContent': {
            template: '<ion-nav-view  name="userContent"/>',

            controller: 'MyCtrl'
          }
        },
        resolve: {

        },
        // controller: 'MyCtrl',
        // views: {
        //   'menuContent': {
        //     templateUrl: 'templates/myItems.html',
        //     controller: 'MyCtrl'
        //   }
        //}
        onEnter: function($stateParams) {
          //if(title){ ... do something ... }
          console.log("app.uresr", $stateParams);
        },
      })
      .state('app.user.myItems', {
        url: '/mine',
        views: {
          //'menuContent': {
          'userContent': {
            templateUrl: 'templates/myItems.html',
            controller: 'MyCtrl'
          }
        },
        onEnter: function($stateParams) {
          //if(title){ ... do something ... }
          console.log("app.uresr.myItems", $stateParams);
        },
      })
      .state('app.marines', {
        url: '/marines',
        views: {
          'menuContent': {
            templateUrl: 'templates/marines.html',
            controller: 'MarinesCtrl'
          }
        }
      })
      .state('app.playlists', {
        url: '/playlists',
        views: {
          'menuContent': {
            templateUrl: 'templates/playlists.html',
            controller: 'PlaylistsCtrl'
          }
        }
      })
      .state('app.single', {
        url: '/playlists/:playlistId',
        views: {
          'menuContent': {
            templateUrl: 'templates/playlist.html',
            controller: 'PlaylistCtrl'
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/marines');
    //$urlRouterProvider.otherwise('/app/search');
  })
  .filter('trusted', ['$sce', function($sce) {
    return function(url) {
      return $sce.trustAsResourceUrl(url);
    };
  }])
  .filter('toArray', [function() {
    return function(object) {
      return _.values(object);
    };
  }])
  .directive('selectable', [function() {
    return {
      restrict: 'A',
      priority: 2000,
      link: function(scope, ele, attrs) {
        var element = ele[0];

        function leave() {
          element.blur();
          element.setAttribute('contenteditable', 'false');
        }

        function keydown(e) {
          switch (e.which) {
            case 33: // pageup
            case 34: // pagedown
            case 35: // end
            case 36: // home
            case 37: // left
            case 38: // up
            case 39: // right
            case 40: // down
            case 17: // ctrl
            case 91: // meta
              return;

            default:
              //CTRL-A /CTRL-C?
              if ((e.keyCode === 'C'.charCodeAt(0) || e.keyCode === 'A'.charCodeAt(0)) && (e.ctrlKey || e.metaKey)) {
                return;
              }
              break;
          }

          leave();
        }

        function mouseDown() {
          element.setAttribute('contenteditable', 'true');
        }
        element.addEventListener('mousedown', mouseDown);
        element.addEventListener('keydown', keydown);
        element.addEventListener('cut', leave);
        element.addEventListener('paste', leave);
        ele.on('$destroy', function() {
          element.removeEventListener('mousedown', mouseDown);
          element.removeEventListener('keydown', keydown);
          element.removeEventListener('cut', leave);
          element.removeEventListener('paste', leave);
        });

      }
    };
  }])
  .directive('input', function($timeout) {
    return {
      restrict: 'E',
      scope: {
        'returnClose': '=',
        'onReturn': '&'
      },
      link: function(scope, element, attr) {
        element.bind('keydown', function(e) {
          if (e.which == 13) {
            if (scope.returnClose) {
              console.log('return-close true: closing keyboard');
              element[0].blur();
            }
            if (scope.onReturn) {
              console.log('on-return set: executing');
              $timeout(function() {
                scope.onReturn();
              });
            }
          }
        });
      }
    }
  });
