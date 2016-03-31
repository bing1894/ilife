angular.module('starter.controllers', ['searchServices',
    // 'angular-underscore'
  ])
  .constant('FBURL', 'https://marine.firebaseio.com/')

.factory('Auth', function($firebaseAuth, FBURL, $window) {
    var ref = new $window.Firebase(FBURL);
    return $firebaseAuth(ref);
  })
  .factory("Fire", function($firebaseObject, FBURL) {

    var itemsRef = new Firebase(FBURL);

    return $firebaseObject(itemsRef);
  })
  // .factory("searchHistory", function($firebaseArray,FBURL) {
  //
  //   var itemsRef = new Firebase(FBURL + "searchHistory" );
  //
  //   return $firebaseArray(itemsRef);
  // })

.controller('AppCtrl', function($scope, $rootScope, $ionicModal, $ionicPopover, $ionicPopup, $timeout, $http, Auth, $firebaseArray, $firebaseObject, localStorageService, FBURL, LifeCloud, firebaseService) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    $rootScope.$on('$stateChangeError',
function(event, toState, toParams, fromState, fromParams, error){
  console.log(error);
 })

    $scope.NO = false;
    $scope.testAlert = function() {
      console.log("testAlert");
      // An alert dialog

        var alertPopup = $ionicPopup.alert({
          title: 'Don\'t eat that!',
          template: 'It might taste good'
        });
        alertPopup.then(function(res) {
          console.log('Thank you for not eating my delicious ice cream cone');
        });

    }
    $scope.uploadItem = function(item, $event) {
      // An alert dialog
      // LifeCloud.add(item);
      console.log("$scope.uploadItem" , $event);
      if($event){
         $event.stopPropagation()
      }
      $scope.myItems[item.KEY] = item;
      console.log("uploadItem ", $scope.myItems);



    }

    $scope.playlists = [{
      title: 'Reggae',
      id: 1
    }, {
      title: 'Chill',
      id: 2
    }, {
      title: 'Dubstep',
      id: 3
    }, {
      title: 'Indie',
      id: 4
    }, {
      title: 'Rap',
      id: 5
    }, {
      title: 'Cowbell',
      id: 6
    }];

    //common function from all
    $scope.shownItem = null;
    $scope.toggleItem = function(item) {
      if ($scope.isItemShown(item)) {
        $scope.shownItem = null;
      } else {
        $scope.shownItem = item;
      }
    };
    $scope.isItemShown = function(item) {
      return $scope.shownItem === item;
    };

    //
    $scope.loginWithGithub = function() {
      Auth.$authWithOAuthRedirect("github", function(error, authData) {
        if (error) {
          console.log("Login Failed!", error);
        } else {
          console.log("Authenticated successfully with payload:", authData);
        }
      });
      // Auth.$authWithPassword({
      //   email: user.email,
      //   password: user.password
      // }).then(function(authData) {
      //   console.log('Logged in successfully as: ', authData.uid);
      //   $scope.loggedInUser = authData;
      //   $scope.closeLogin();
      //
      // }).catch(function(error) {
      //   console.log('Error: ', error);
      //   //$scope.closeLogin();
      //
      // });
      //console.log('Doing login', $scope.loginData);


    };
    // EMAIL & PASSWORD AUTHENTICATION



    $scope.saveCache = function(key, obj) {
      var s = JSON.stringify(obj)
      localStorageService.set(key, s);
    };
    $scope.loadCache = function(key) {
      var s = localStorageService.get(key);
      var obj = JSON.parse(s);
      return obj;

    };
    // Create a new user, called when a user submits the signup form
    $scope.createUser = function(user) {
      Auth.$createUser({
        email: user.email,
        password: user.password
      }).then(function() {
        // User created successfully, log them in
        return Auth.$authWithPassword({
          email: user.email,
          password: user.password
        });
      }).then(function(authData) {
        console.log('Logged in successfully as: ', authData.uid);
        $scope.loggedInUser = authData;
        $scope.closeLogin();
      }).catch(function(error) {
        console.log('Error: ', error);
      });
    };



    // Form data for the login modal
    //$scope.loginData = {};
    $scope.loginData = $scope.loadCache('loginData');

    // Create the login modal that we will use later
    // $ionicModal.fromTemplateUrl('templates/login.html', {
    //   scope: $rootScope
    // }).then(function(modal) {
    //   $scope.modal = modal;
    // });
    //
    // // Triggered in the login modal to close it
    // $scope.closeLogin = function() {
    //   $scope.modal.hide();
    // };
    //
    // // Open the login modal
    // $rootScope.openLogin = function() {
    //   if (!$scope.loggedInUser) {
    //     $scope.modal.show();
    //   } else {
    //     console.log("openLogin() alrealy logged in as ", $scope.loggedInUser);
    //   }
    // };
    $scope.flogin = function() {
      Auth.$authWithOAuthRedirect("facebook").then(function(authData) {
        // User successfully logged in
      }).catch(function(error) {
        if (error.code === "TRANSPORT_UNAVAILABLE") {
          Auth.$authWithOAuthPopup("facebook").then(function(authData) {
            // User successfully logged in. We can log to the console
            // since we’re using a popup here
            console.log(authData);
          });
        } else {
          // Another error occurred
          console.log(error);
        }
      });
    };
    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
      console.log('Doing login', $scope.loginData);

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function() {
        $scope.closeLogin();
      }, 1000);
    };
    $ionicPopover.fromTemplateUrl('templates/more-popover.html', {
      scope: $rootScope
    }).then(function(modal) {
      $scope.popMenu = modal;

    });

    $scope.showMoreMenu = function($event) {
       console.log('$scope.popMenu', $scope.popMenu, $event);

      $scope.popMenu.show($event);
    };

    //console.log($http);
  })
  .controller("SearchCtrl", function($scope, $http, searchService, $state) {
    $scope.name = "SearchCtrl";
    $scope.q = "";
    //$scope.items = [];
    //searchHistory.$bindTo($scope, "searchHistory");
    //$scope.searchHistory = searchHistory
    $scope.onSearch = function(q, notSave) {
      if ($scope.loggedInUser && !notSave) {
        // $scope.searchHistory.$add({
        //   q:q,
        //   uid : $scope.loggedInUser.uid,
        //   provider : $scope.loggedInUser.provider
        // });
        //$scope.searchHistory[q] = null;
        if ($scope.searchHistory[q]) {
          $scope.searchHistory[q].timestamp = _.now();

        } else {
          $scope.searchHistory[q] = {
            q: q,
            timestamp: _.now()
          };
        }
        // angular.merge($scope.searchHistory[q], {timestamp: _.now()});
        //
        // console.log($scope.searchHistory[q]);
        //
        // $scope.searchHistory.$save();
      }
      //cordova.plugins.Keyboard.close();
      console.log("SearchCtrl onSearch", q, $scope.loggedInUser, $scope.searchHistory);
      //test(this, $http);
      $scope.items = null;

      searchService.search(q, $scope).then(function(result) {
        // $ionicLoading.hide();
        // $rootScope.entries = entries;
        // $state.go("Entries");

        console.log("searchService return", result);


      });

    };
    $scope.openDetail = function(key, item) {
      // var url = "#/app/detail/" + key + "?eol=" + item.EOL.id + "&gbif=" + item.GBIF.key;
      console.log("openDetail", key, item);
      $state.go("app.detail", {
        key: key,
        eol: (item.EOL ? item.EOL.id : ''),
        gbif: (item.GBIF ? item.GBIF.key : ''),

      })
    }

  })
  .controller("DetailCtrl", function($scope, searchService, key, eolId, gbifId) {
    //$scope.item = item;
    $scope.key = key;
    $scope.item = searchService.get(key);
    console.log("DetailCtrl with", key, eolId, gbifId, $scope.item);
    if (!$scope.item) {
      $scope.item = {};
      searchService.loadDetailEol({
        key: eolId,
        name: key
      }, $scope.item);
    }
  })
  .controller("MarinesCtrl", function($scope, $firebaseObject, $firebaseArray) {
    //$scope.q = "123";
    var ref = new Firebase("https://marine.firebaseio.com/");

    //var syncObject = $firebaseObject(ref.child('marines'));
    var syncObject = $firebaseArray(ref.child('marines'));
    // to take an action after the data loads, use the $loaded() promise
    syncObject.$loaded().then(function() {
      console.log("loaded record:", syncObject);

      //  // To iterate the key/value pairs of the object, use angular.forEach()
      //  angular.forEach(obj, function(value, key) {
      //     console.log(key, value);
      //  });
    });

    // synchronize the object with a three-way data binding
    // click on `index.html` above to see it used in the DOM!
    //syncObject.$bindTo($scope, "items");
    $scope.items = syncObject;
  })
  .controller("MyCtrl", function($scope, LifeCloud) {
    console.log("in MyCtrl", $scope);
    $scope.editBtnText = 'Edit';
    //$scope.items = LifeCloud.all();
    $scope.toggleDelete = function() {
        $scope.isDeletingItems = !$scope.isDeletingItems;
        $scope.isReorderingItems = false;
        $scope.editBtnText = ($scope.isDeletingItems ? 'Done' : 'Edit');
      };

    $scope.deleteListItem = function (key, index){
      console.log(key, index);
      $scope.myItems[key ] = null;
     }

  })
  .controller("GalleryCtrl", function($scope, $timeout, Flickr) {
    $scope.gallaryId = new Date().getTime();
    $scope.q = 'whale';
    $scope.photos = [{
      src: 'http://www.wired.com/images_blogs/rawfile/2013/11/offset_WaterHouseMarineImages_62652-2-660x440.jpg',
      sub: 'This is a <b>subtitle</b>'
    }, {
      src: 'http://www.gettyimages.co.uk/CMS/StaticContent/1391099215267_hero2.jpg',
      sub: '' /* Not showed */
    }]
    $scope.searchImage = function(q, page) {

      console.log("searchImage", q);
      page = page ? page : 0;
      $scope.loading = true;

      Flickr.search(q, page).then(function(data) {

        $scope.photos = data.photos.photo;
        // $scope.photos.length = 0;
        // _.each(data.photos.photo, function(photo){
        //   // photo.src = "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_s.jpg";
        //   // photo.sub = ''
        //   $scope.photos.push(photo);
        // });
        $scope.page = data.photos.page;
        $scope.pages = data.photos.pages;
        $scope.total = data.photos.total;
        //$scope.paginator();
        $scope.loading = false;
        //   $timeout(function () {
        //     $scope.gallaryId = new Date().getTime()
        // },1000);
        //$apply($scope.gallaryId = new Date().getTime());
        //$scope.gallaryId = Math.random()*10000;
        console.log($scope.gallaryId, data)

      }, function(err) {
        console.log('Failed: ' + err);
        $scope.loading = false;
      });
    }

    // scope.search = function(search, page){
    //     $scope.loading = true;
    //     var promise = Flickr.search(search, page);
    //     promise.then(function(data) {
    //         $scope.photos = data.photos;
    //         $scope.photos = data.photos.photo;
    //         $scope.page = data.photos.page;
    //         $scope.pages = data.photos.pages;
    //         $scope.total = data.photos.total;
    //         $scope.paginator();
    //         $scope.loading = false;
    //
    //     }, function(err) {
    //         console.log('Failed: ' + err);
    //         $scope.loading = false;
    //     });
    // }
  })
  .controller('PlaylistsCtrl', function($scope, $http, searchService) {

    $scope.videos = [];

    $scope.playerVars = {
      rel: 0,
      showinfo: 0,
      modestbranding: 0,
    }
    $scope.searchVideo = function(q) {
      console.log("searchVideo", q)
      searchService.searchVideo(q).success(function(response) {
        $scope.videos = response.items;
        // angular.forEach(response.items, function(child){
        //   $scope.videos.push(child);
        // });
      });
    }

    // $scope.youtubeParams = {
    //   //key: 'AIzaSyAnAi9xKNqI_xNGDKHtFZrInz5l_QkMqNs',
    //   key: 'AIzaSyBeYVX8nOKr6g5SPCb66if9pZIaH8CiGeM',
    //
    //   type: 'video',
    //   maxResults: '5',
    //   part: 'id,snippet',
    //   q: '鲸鲨｜whale shark',
    //   order: 'viewCount',
    //   //channelId: 'UCeEqIv7lVwOOLnwxuuhQFuQ',
    // }
    //
    // $http.get('https://www.googleapis.com/youtube/v3/search', {params: $scope.youtubeParams}).success(function(response){
    //   angular.forEach(response.items, function(child){
    //     $scope.videos.push(child);
    //   });
    // });



  })

.controller('PlaylistCtrl', function($scope, $stateParams) {});

function test($scope, $http) {
  console.log("test in ", $scope.q);
  //$scope.q = "ill";
  var url = "http://api.gbif.org/v1/species/search?q=" + $scope.q;
  //console.log($http);
  var req = {
    method: 'GET',
    url: url,
    // headers: {
    //   'Content-Type': undefined
    // },
    //data: { test: 'test' }
  };

  $http(req).then(function successCallback(response) {
    // this callback will be called asynchronously
    // when the response is available
    console.log(response);
    $scope.items = response.data.results;

  }, function errorCallback(response) {
    // called asynchronously if an error occurs
    // or server returns response with an error status.
  });
  // Object
  // $$hashKey
  // :
  // "object:33"
  // authorship
  // :
  // " (Günther, 1867)"
  // canonicalName
  // :
  // "Pseudoginglymostoma brevicaudatum"
  // class
  // :
  // "Chondrichthyes"
  // classKey
  // :
  // 113270358
  // datasetKey
  // :
  // "cbb6498e-8927-405a-916b-576d00a6289b"
  // descriptions
  // :
  // Array[1]
  // family
  // :
  // "Ginglymostomatidae"
  // familyKey
  // :
  // 115199024
  // genus
  // :
  // "Pseudoginglymostoma"
  // genusKey
  // :
  // 115199026
  // habitats
  // :
  // Array[0]
  // higherClassificationMap
  // :
  // Object
  // key
  // :
  // 113271903
  // kingdom
  // :
  // "Animalia"
  // kingdomKey
  // :
  // 112707351
  // nameType
  // :
  // "SCIENTIFIC"
  // nomenclaturalStatus
  // :
  // Array[0]
  // numDescendants
  // :
  // 0
  // numOccurrences
  // :
  // 0
  // order
  // :
  // "Orectolobiformes"
  // orderKey
  // :
  // 115199013
  // parent
  // :
  // "Pseudoginglymostoma"
  // parentKey
  // :
  // 115199026
  // phylum
  // :
  // "Chordata"
  // phylumKey
  // :
  // 113225636
  // rank
  // :
  // "SPECIES"
  // scientificName
  // :
  // "Pseudoginglymostoma brevicaudatum (Günther, 1867)"
  // species
  // :
  // "Pseudoginglymostoma brevicaudatum"
  // speciesKey
  // :
  // 113271903
  // synonym
  // :
  // false
  // threatStatuses
  // :
  // Array[0]
  // vernacularNames
  // :
  // Array[1]

}
