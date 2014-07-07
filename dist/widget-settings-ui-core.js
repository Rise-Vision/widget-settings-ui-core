
angular.module('risevision.widget.common', []);

angular.module('risevision.widget.common')
  .controller('settingsController', ['$scope', 'settingsSaver', 'settingsGetter', 'defaultSettings',
    function ($scope, settingsSaver, settingsGetter, defaultSettings) {

    $scope.settings = { params: {}, additionalParams: {}};
    $scope.alerts = [];

    $scope.getAdditionalParam = function (name, defaultVal) {
      var val = $scope.settings.additionalParams[name];
      if(angular.isUndefined(val)) {
        return defaultVal;
      }
      else {
        return val;
      }
    };

    $scope.setAdditionalParam = function (name, val) {
      $scope.settings.additionalParams[name] = val;
    };

    $scope.loadAdditionalParams = function () {
      settingsGetter.getAdditionalParams().then(function (additionalParams) {
        $scope.settings.additionalParams = additionalParams;
      },
      function (err) {alert (err); });
    };

    $scope.setAdditionalParams = function (name, val) {
      $scope.settings.additionalParams[name] = val;
    };

    $scope.saveSettings = function () {
      //clear out previous alerts, if any
      $scope.alerts = [];

      $scope.$emit('collectAdditionalParams');

      settingsSaver.saveSettings($scope.settings).then(function () {
        //TODO: perhaps show some indicator in UI?
      }, function (err) {
        $scope.alerts = err.alerts;
      });

    };

    $scope.settings.params = settingsGetter.getParams();
    $scope.settings.additionalParams = defaultSettings.additionalParams || {};
    $scope.loadAdditionalParams();
  }])

  .directive('scrollOnAlerts', function() {
    return {
      restrict: 'A', //restricts to attributes
      scope: false,
      link: function($scope, $elm) {
        $scope.$watchCollection('alerts', function (newAlerts, oldAlerts) {
          if(newAlerts.length > 0 && oldAlerts.length === 0) {
            $('body').animate({scrollTop: $elm.offset().top}, 'fast');
          }
        });
      }
    };
});

angular.module('risevision.widget.common')
  .factory('commonSettings', ['$log', function ($log) {
    $log.debug('Initializing new RiseVision common settings instance...');
    //return new RiseVision.Common.Settings();
  }]);

angular.module('risevision.widget.common')
  .factory('gadgetsApi', ['$window', function ($window) {
    return $window.gadgets;
  }]);

angular.module('risevision.widget.common')
  .service('i18nLoader', ['$window', '$q', function ($window, $q) {
    var deferred = $q.defer();

    $window.i18n.init({ fallbackLng: 'en' }, function () {
      deferred.resolve($window.i18n);
    });

    this.get = function () {
      return deferred.promise;
    };
  }]);

angular.module('risevision.widget.common')
  .service('settingsSaver', ['$q', '$log', 'gadgetsApi', 'settingsParser',
  function ($q, $log, gadgetsApi, settingsParser) {

    this.saveSettings = function (settings, validator) {
      var deferred = $q.defer();
      var alerts = [];

      if (validator) {
        alerts = validator(settings);
      }

      if(alerts.length > 0) {
        $log.debug('Validation failed.', alerts);
        deferred.reject({alerts: alerts});
      }

      var str = settingsParser.encodeParams(settings.params);
      var additionalParamsStr =
        settingsParser.encodeAdditionalParams(settings.additionalParams);

      gadgetsApi.rpc.call('', 'rscmd_saveSettings', function (result) {
        $log.debug('encoded settings', JSON.stringify(result));
        $log.debug('Settings saved. ', settings);

        deferred.resolve(result);
      }, {
        params: str,
        additionalParams: additionalParamsStr
      });

      return deferred.promise;
    };

  }])

  .service('settingsGetter', ['$q', 'gadgetsApi', '$log', 'settingsParser', '$window', 'defaultSettings',
    function ($q, gadgetsApi, $log, settingsParser, $window, defaultSettings) {

      this.getAdditionalParams = function () {
        var deferred = $q.defer();
        var defaultAdditionalParams = defaultSettings.additionalParams || {};
        gadgetsApi.rpc.call('', 'rscmd_getAdditionalParams', function (result) {
          if(result) {
            result = settingsParser.parseAdditionalParams(result);
          }
          else {
            result = {};
          }
          $log.debug('getAdditionalParams returns ', result);
          deferred.resolve(angular.extend(defaultAdditionalParams, result));
        });

        return deferred.promise;
      };

      this.getParams = function () {
        var defaultParams = defaultSettings.params || {};
        return angular.extend(defaultParams,
          settingsParser.parseParams($window.location.search));
      };
  }])

  .service('settingsParser', [function () {
    this.parseAdditionalParams = function (additionalParamsStr) {
      if(additionalParamsStr) {
        return JSON.parse(additionalParamsStr);
      }
      else {
        return {};
      }
    };

    this.encodeAdditionalParams = function (additionalParams) {
      return JSON.stringify(additionalParams);
    };

    this.encodeParams = function (params) {
      var str = [];
      for(var p in params) {
        if (params.hasOwnProperty(p)) {
          str.push('up_' + encodeURIComponent(p) + '=' + encodeURIComponent(params[p]));
        }
      }
      return '?' + str.join('&');
    };

    function stripPrefix(name) {
      if(name.indexOf('up_') === 0) {
        return name.slice(3);
      }
      else {
        return null;
      }
    }

    this.parseParams = function (paramsStr) {
      //get rid of preceeding '?'
      if(paramsStr[0] === '?') {
        paramsStr = paramsStr.slice(1);
      }
      var result = {};
      var vars = paramsStr.split('&');
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        var name = stripPrefix(decodeURIComponent(pair[0]));
        if (name) {
          //save settings only if it has up_ prefix. Ignore otherwise
          result[name] = decodeURIComponent(pair[1]);
        }
      }
      return result;
    };

  }])

  .value('defaultSettings', {});
