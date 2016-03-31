// var searchServices = angular.module('searchServices', ['ngResource']);
//
// searchServices.factory('Phone', ['$http',
//   function($http){
//     return $resource('phones/:phoneId.json', {}, {
//       query: {method:'GET', params:{phoneId:'phones'}, isArray:true}
//     });
//   }]);
(function() {
  /* global angular,window,cordova,console */
  angular.module('firebaseService', ['firebase'])
    .factory("Auth", ["$firebaseAuth", "$rootScope",
      function($firebaseAuth, $rootScope) {
        var ref = new Firebase(firebaseUrl);
        return $firebaseAuth(ref);
      }
    ])
    .factory('userService', function($firebase, $firebaseObject,$firebaseArray ,Auth) {
      var baseRef = new Firebase(firebaseUrl);
      var authData = Auth.$getAuth();
      return {
      user: function() {
          var authData = Auth.$getAuth();
          return authData;
      },
      }
    })
    .factory('firebaseService', function($firebase, $firebaseObject,$firebaseArray ,Auth) {
      var baseRef = new Firebase(firebaseUrl);
      var ref = new Firebase(firebaseUrl);

      var storage;

      return {
        test: function() {
          console.log("firebaseService firebaseService test()", Auth.$getAuth());
        },

        initObject: function(type) {//'life' or 'searchHistory'
          var ref;
          var storage;
          var authData = Auth.$getAuth();
          if (authData) {
            ref = baseRef.child('users').child(authData.uid).child(type);
            storage = $firebaseObject(ref);
            // storage = $firebaseArray(ref);
          } else {
            storage = null;
          }
          return storage;
        },
      }
    })

  .factory('LifeCloud', function($firebase, $firebaseObject,$firebaseArray ,Auth) {
    var baseRef = new Firebase(firebaseUrl);
    var ref = new Firebase(firebaseUrl);

    var storage;

    return {
      test: function() {
        console.log("firebaseService LifeCloud test()", Auth.$getAuth());
      },

      init: function() {
        var ref;
        var authData = Auth.$getAuth();
        if (authData) {
          ref = baseRef.child('users').child(authData.uid).child('life');
          storage = $firebaseObject(ref);
          // storage = $firebaseArray(ref);
        } else {
          storage = null;
        }
        return storage;
      },
//after is useless, use bindto instead of add()
      add: function(item) {
        //console.log("sending message from :" + from.displayName + " & message is " + message);
        if (item) {
          if (!storage) {
            this.init();
          }
          console.log(storage)
          if (storage) {
            storage[item.KEY] = item;
            storage.$save().then(function(data) {
              console.log("item added to firebase", data);
            });
          }
        }
      },
      all: function() {
        if (!storage) {
          this.init();
        }
        console.log(storage)
        return storage;
      },
      remove: function(chat) {
        chats.$remove(chat).then(function(ref) {
          ref.key() === chat.$id; // true item has been removed
        });
      },
      get: function(chatId) {
        for (var i = 0; i < chats.length; i++) {
          if (chats[i].id === parseInt(chatId)) {
            return chats[i];
          }
        }
        return null;
      },
      getSelectedRoomName: function() {
        var selectedRoom;
        if (selectedRoomId && selectedRoomId != null) {
          selectedRoom = Rooms.get(selectedRoomId);
          if (selectedRoom)
            return selectedRoom.name;
          else
            return null;
        } else
          return null;
      },
      selectRoom: function(roomId) {
        console.log("selecting the room with id: " + roomId);
        selectedRoomId = roomId;
        if (!isNaN(roomId)) {
          chats = $firebase(ref.child('rooms').child(selectedRoomId).child('chats')).$asArray();
        }
      },

    }
  })

  /**
   * Simple Service which returns Rooms collection as Array from Salesforce & binds to the Scope in Controller
   */
  .factory('Rooms', function($firebase) {
    // Might use a resource here that returns a JSON array
    var ref = new Firebase(firebaseUrl);
    var rooms = $firebase(ref.child('rooms')).$asArray();

    return {
      all: function() {
        return rooms;
      },
      get: function(roomId) {
        // Simple index lookup
        return rooms.$getRecord(roomId);
      }
    }
  });
  angular.module('searchServices', [])
    .factory('searchService', function($http, $q) {

      var entries;
      var searchResults = {};
      var URLGbif = "http://api.gbif.org/v1/species/";
      var URLEol = "http://eol.org/api/";

      //var URLGbif = ""
      return {
        get: function(key) {
          return searchResults[key];
        },
        searchVideo: function(q) {
          var youtubeParams = {
            //key: 'AIzaSyAnAi9xKNqI_xNGDKHtFZrInz5l_QkMqNs',
            key: 'AIzaSyBeYVX8nOKr6g5SPCb66if9pZIaH8CiGeM',

            type: 'video',
            maxResults: '5',
            part: 'id,snippet',

            q: q, //'鲸鲨｜whale shark',
            // q: 'Rhincodon typus|' + q,
            order: 'date',
            safeSearch: 'strict',
            videoEmbeddable: 'true',
            //order: 'viewCount',
            //channelId: 'UCeEqIv7lVwOOLnwxuuhQFuQ',
          }
          https: //www.googleapis.com/youtube/v3/search?key=AIzaSyBeYVX8nOKr6g5SPCb66if9pZIaH8CiGeM&maxResults=5&order=viewCount&part=id,snippet&q=china%7C%E9%B2%B8%E9%B2%A8&type=video
            // https://www.googleapis.com/youtube/v3/search?key=AIzaSyBeYVX8nOKr6g5SPCb66if9pZIaH8CiGeM&maxResults=5&order=viewCount&part=id,snippet&q=china+abc&type=video
            return $http.get('https://www.googleapis.com/youtube/v3/search', {
              params: youtubeParams
            }).success(function(response) {
              console.log("searchVideo", q, response);
              return response.items;
              // angular.forEach(response.items, function(child){
              //   $scope.videos.push(child);
              // });
            });
        },
        search: function(q, $scope) {
          var self = this;
          var deferred = $q.defer();
          //console.log('getEntries for '+url);
          //deferred.resolve(entries);
          // if(entries) {
          // 	console.log('from cache');
          // 	deferred.resolve(entries);
          // } else {
          // 	google.load("feeds", "1",{callback:function() {
          // 		console.log('googles init called');
          // 		var feed = new google.feeds.Feed(url);
          //
          // 		feed.setNumEntries(10);
          // 		feed.load(function(result) {
          // 			entries = result.feed.entries;
          // 			deferred.resolve(entries);
          // 		});
          //
          //
          // 	}});

          //}

          var url = "http://api.gbif.org/v1/species/search?q=" + q;
          //return this.runUrl(url);
          var req = makeRequestForSource("GBIF", q);
          this.runUrl(req).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            console.log(response);
            //$scope.items = response.data.results;
            searchResults = self.handelResult(response, $scope, "GBIF");
            deferred.resolve(response);


          }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log(response);
            return response;
          });

          req = makeRequestForSource("EOL", q);
          this.runUrl(req).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            //console.log(response);
            //$scope.items = response.data.results;
            searchResults = self.handelResult(response, $scope, "EOL");
            deferred.resolve(response);


          }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            return response;
          });
          return deferred.promise;
        },
        handelResult: function(response, $scope, source) {
          var self = this;

          console.log($scope.items, _.size(response.data.results));
          // $scope.items =  $scope.items.concat(response.data.results);

          if (!$scope.items) {
            //$scope.items =  $scope.items.concat(response.data.results);
            $scope.items = {};
          }
          //var newItem;

          _.each(response.data.results, function(item) {
            var newItem;
            var key;
            if (source == 'EOL') {
              var keys = item.title.split('(');
              key = keys[0].trim();
            } else if (source == 'GBIF') {
              key = item.canonicalName;
            }

            if (!$scope.items[key]) {
              $scope.items[key] = {
                sources: []
              };
            }
            if (source == 'EOL') {
              $scope.items[key].detail = item.content;
              $scope.items[key].sources = _.union($scope.items[key].sources, ['EOL']);
              self.loadDetailEol({
                key: item.id,
                name: key
              }, $scope.items[key]);
              //}, $scope);

            } else if (source == 'GBIF') {
              if (item.descriptions && item.descriptions.length > 0) {
                $scope.items[key].detail = item.descriptions[0].description
              }
              $scope.items[key].sources = _.union($scope.items[key].sources, ['GBIF']);
              $scope.items[key].scientificName = item.scientificName;
              self.loadDetailGbif({
                key: item.key,
                name: key
              }, $scope);
            }
            $scope.items[key][source] = item;


            // if ($scope.items[newItem.Mkey]) {
            //   $scope.items[newItem.Mkey].Msources = _.union($scope.items[newItem.Mkey].Msources, newItem.Msources);
            //   $scope.items[newItem.Mkey][source] = newItem;
            // } else {
            //   $scope.items[newItem.Mkey] = newItem;
            // }
          });

          return ($scope.items);
          //console.log(searchResults);


        },
        loadDetailEol: function(params, target) {
          // http://eol.org/api/data_objects/1.0/30073527.json?taxonomy=false&cache_ttl=&language=en
          //URL: http://eol.org/api/pages/1.0.json?batch=false&id=28519&images_per_page=2&images_page=1&videos_per_page=0&videos_page=1&sounds_per_page=0&sounds_page=1&maps_per_page=0&maps_page=1&texts_per_page=2&texts_page=1&iucn=false&subjects=overview&licenses=all&details=true&common_names=true&synonyms=false&references=false&taxonomy=true&vetted=0&cache_ttl=&language=en

          var self = this;
          var req = {
            method: 'GET'
          };
          if (params.key) {

            var url = "http://eol.org/api/pages/1.0.json?batch=false&images_per_page=2&images_page=1&videos_per_page=0&videos_page=1&sounds_per_page=0&sounds_page=1&maps_per_page=0&maps_page=1&texts_per_page=2&texts_page=1&iucn=false&subjects=overview&licenses=all&details=true&common_names=true&synonyms=false&references=false&vetted=0&cache_ttl=&language=en";
            req = {
              method: 'GET',
              url: url,
              params: {
                id: params.key,
                taxonomy: true,
              }
            }
          }



          return self.runUrl(req).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available

            var results = response.data.dataObjects;
            if(!target.KEY) {
              target.KEY = response.data.scientificName;
            }
            // var target = {};
            // if($scope){
            //   target = $scope.items[params.name];
            // }



            console.log("loadDetailEol", params.name, url, results);
            target.media = target.media ? target.media : [];
            target.contents = target.contents ? target.contents : [];
            //$scope.items[params.name].media = $scope.items[params.name].media ? $scope.items[params.name].media : [];
            _.each(results, function(r) {
              r.TYPE = 'EOL';
              if (r.dataType.includes("Image")) {

                r.URL = r.eolMediaURL;
                //$scope.items[params.name].media.push(r);
                target.media.push(r);
              } else if (r.dataType.includes("Text") && r.description) {
                r.TITLE = r.title?r.title:'';
                r.DETAIL = r.description;
                target.contents.push(r);
              }
            });


            //var tax = response.data.texonConcepts;
            // if(tax[0]){
            //
            // }


            //$scope.items[params.name].media = response.data.results;
            //return response

          });
        },
        loadDetailGbif: function(params, $scope) {
          var self = this;
          var req = {
            method: 'GET'
          };
          if (params.key) {

            var url = URLGbif + params.key + "/media?limit=2";
            req = {
              method: 'GET',
              url: url
            }
          }

          self.runUrl(req).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            console.log(params.name, response.data.results);
            $scope.items[params.name].media = $scope.items[params.name].media ? $scope.items[params.name].media : [];
            _.each(response.data.results, function(r) {
              r.TYPE = 'GBIF';
              r.URL = r.identifier;
              $scope.items[params.name].media.push(r);
            });
            return response

          });
        },
        runUrl: function(req) {


          return $http(req).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            console.log(req.url, response);
            return response


          }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            return response;
          });
        },



      };
    });

}());

// function handelResult(response, $scope, source) {
//   console.log($scope.items, _.size(response.data.results));
//   // $scope.items =  $scope.items.concat(response.data.results);
//
//   if (!$scope.items) {
//     //$scope.items =  $scope.items.concat(response.data.results);
//     $scope.items = {};
//   }
//   //var newItem;
//
//   _.each(response.data.results, function(item) {
//     var newItem;
//     if (source == 'EOL') {
//       newItem = prepareItemEol(item);
//     } else if (source == 'GBIF') {
//       newItem = prepareItemGbif(item);
//     }
//     if ($scope.items[newItem.Mkey]) {
//       $scope.items[newItem.Mkey].Msources = _.union($scope.items[newItem.Mkey].Msources, newItem.Msources);
//       $scope.items[newItem.Mkey][source] = newItem;
//     } else {
//       $scope.items[newItem.Mkey] = newItem;
//     }
//   });
//
//   return($scope.items);
//   //console.log(searchResults);
//
//
//   // switch(source){
//   //   case 'EOL':
//   //     angular.forEach(response.data.results, function(item){
//   //
//   //       $scope.items.push(prepareItemEol(item));
//   //
//   //     });
//   //     break;
//   //   case 'GBIF':
//   //   default:
//   //   angular.forEach(response.data.results, function(item){
//   //
//   //
//   //     $scope.items.push(prepareItemGbif(item));
//   //
//   //     });
//   //   break;
//   //
//   // }
// }
//
function prepareItemEol(item) {
  // 生成新条目的HTML
  var keys = item.title.split('(');

  item.Mkey = keys[0].trim();

  item.Mdetail = item.content
  item.Msources = ['EOL'];
  return item;
}

function prepareItemGbif(item) {
  // 生成新条目的HTML
  var nitem = {};
  nitem.key = item.canonicalName;
  if (item.descriptions && item.descriptions.length > 0) {
    nitem.detail = item.descriptions[0].description
  }
  nitem.sources = ['GBIF'];
  nitem.scientificName = item.scientificName;
  nitem.GBIF = item;

  return nitem;
}

function addItemGbif(item) {
  // 生成新条目的HTML
  var html = '';
  html += '<li id="' + item.canonicalName + '" class="marine-item"><div class="item-inner"><div class="item-title"> GBIF ' + item.scientificName + '</div></div></li>';

  // 添加新条目
  $('.infinite-scroll-bottom .list-container').append(html);
  //var key = item.canonicalName;
  if (key = item.canonicalName) {
    if (!searchResults[key]) {
      searchResults[key] = {};
    }
    searchResults[key].gbif = item;
  }

}

function showItems(items, source, clear) {
  $sel = $('.infinite-scroll-bottom .list-container');
  if (clear) {
    $sel.empty();
  }
  switch (source) {


    case 'EOL':

      _.each(items, function(item) {
        addItemEol(item);
      });
      break;
    case 'GBIF':
      _.each(items, function(item) {
        addItemGbif(item);
      });
      break;
    default:
  }

}

function makeRequestForSource(source, q) {
  var req = {};
  var url = "";
  switch (source) {
    case 'EOL':
      var url = "http://eol.org/api/search/1.0.json";

      req = {
        method: 'GET',
        url: url,
        // headers: {
        //   'Content-Type': undefined
        // },
        params: {
          q: q
        }
      };
      break;
    case 'GBIF':

      var url = "http://api.gbif.org/v1/species/search";

      req = {
        //method: 'GET',
        method: 'JSONP',
        url: url,
        params: {
          q: q,
          rank: 'SPECIES',
          limit: 10,
          t: "test",
        }
      };
      break;
    default:
  }
  return req;

}
