angular.module('flickrServices',['ngResource'])
.factory('Flickr', function($http, $q){
        var self = this;
        self.perPage =  10;
        self.api_key = "7df3ba43176e9deb9644e1a37d09b634";
        self.base_url= "https://api.flickr.com/services/rest/";

        self.search = function(search, page){
            var deferred = $q.defer();

            var params = {
                api_key: self.api_key,
                per_page: self.perPage,
                format: 'json',
                nojsoncallback: 1,
                page: (page != null && page > 0) ? page : 1,
                method: (search != null && search.length > 0) ? 'flickr.photos.search' : 'flickr.photos.getRecent'
            };

            if ((search != null && search.length > 0)) {
                params.text = search;
            }

            $http({method: 'GET', url: self.base_url, params: params}).
                success(function(data, status, headers, config) {
                     deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    deferred.reject(status);
                 });

            return deferred.promise;

        }
        return this;
    });
