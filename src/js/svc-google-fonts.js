angular.module("risevision.widget.common")
  .factory("googleFontLoader", ["$http", "$q", "angularLoad", function ($http, $q, angularLoad) {

    var factory = {},
      allFonts = [];

    factory.getGoogleFonts = function() {
      if (allFonts.length === 0) {
        // Get list of Google fonts sorted alphabetically.
        return $http.get("https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyBXxVK_IOV7LNQMuVVo_l7ZvN53ejN86zY&sort=alpha", { cache: true })
          .then(function(resp) {
            var item = null;

            if (resp.data && resp.data.items) {
              for (var i = 0, length = resp.data.items.length; i < length; i++) {
                item = resp.data.items[i];

                // Don't return those fonts that have a subset of "khmer".
                if (item.subsets && (item.subsets.length === 1) &&
                  (item.subsets[0].toLowerCase() === "khmer")) {
                    continue;
                }

                allFonts.push(item.family);
              }

              return loadFonts();
            }
          });
      }
      else {
        return loadFonts();
      }
    };

    /* Filter list of fonts to only return those that are Google fonts. */
    factory.getFontsUsed = function(familyList) {
      var fontsUsed = [];

      angular.forEach(allFonts, function (family) {
        if (familyList.indexOf(family) !== -1) {
          fontsUsed.push(family);
        }
      });

      return fontsUsed;
    };

    /* Load the Google fonts. */
    function loadFonts() {
      var fonts = "",
        urls = [],
        promises = [];

      angular.forEach(allFonts, function(family){
        var deferred  = $q.defer();

        var fontBaseUrl = "//fonts.googleapis.com/css?family=";
        var url = fontBaseUrl + family;
        var spaces = false;
        var fallback = ",sans-serif;";

        angularLoad.loadCSS(url).then(function(){
          urls.push(url);

          // check for spaces in family name
          if (/\s/.test(family)) {
            spaces = true;
          }

          if (spaces) {
            // wrap family name in single quotes
            fonts += family + "='" + family + "'" + fallback;
          }
          else {
            fonts += family + "=" + family + fallback;
          }

          deferred.resolve({ fonts: fonts, urls: urls });
        })
        .catch(function() {
          deferred.resolve({ fonts: fonts, urls: urls });
        });

        promises.push(deferred.promise);
      });

      return $q.all(promises);
    }

    return factory;
  }]);
