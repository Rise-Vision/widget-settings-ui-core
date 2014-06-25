
angular.module('risevision.widget.common', []);

angular.module('risevision.widget.common')
  .controller('settingsController', ['$scope', 'settingsSaver', 'settingsGetter', '$timeout',
    function ($scope, settingsSaver, settingsGetter, $timeout) {

    $scope.settings = { params: {up_layout: 'current'}, additionalParams: {}};
    $scope.alerts = [];

    $scope.getAdditionalParams = function (name, defaultVal) {
      var val = $scope.settings.additionalParams[name];
      if(angular.isUndefined(val)) {
        return defaultVal;
      }
      else {
        return val;
      }
    };

    $scope.setAdditionalParams = function (name, val) {
      $scope.settings.additionalParams[name] = val;
    };

    $scope.saveSettings = function () {
      //clear out previous alerts, if any
      $scope.alerts = [];

      $scope.$emit('collectAdditionalParams');

      $timeout (function () {
        settingsSaver.saveSettings($scope.settings).then(function () {
          //TODO: perhaps show some indicator in UI?
        }, function (err) {
          $scope.alerts = err.alerts;
        });
      }, 0);

    };

    settingsGetter.getAdditionalParams().then(function (additionalParams) {
      $scope.settings.additionalParams = additionalParams;
    });
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
  .directive('fontPicker', ['i18nLoader', '$log', function (i18nLoader, $log) {
    return {
      restrict: 'A',
      scope: false,
      transclude: false,
      link: function ($scope, elm, attrs) {
        var stripLast = function (str, strToStrip) {
          var index = str.indexOf(strToStrip);
          if(index >= 0) {
            str = str.substring(0, str.lastIndexOf(strToStrip));
          }
          return str;
        };

        var valOrDefault = function (val, defaultVal) {
          if (angular.isUndefined(val) || val === null) {
            return defaultVal;
          }
          else {
            return val;
          }
        };
        var $elm = $(elm);
        var prefix = attrs.fontPickerPrefix || stripLast(attrs.id, '-font');
        var picker = $elm.data('font-picker');
        $elm.fontPicker({
          'i18n-prefix': attrs.fontPickerI18nPrefix || attrs.id,
          'defaults' : {
            'font' : $scope.getAdditionalParams(
              prefix + '-font', attrs.fontPickerDefaultFont),
            'font-url' : $scope.getAdditionalParams(
              prefix + '-font-url', attrs.fontPickerDefaultFontUrl),
            'font-size' : $scope.getAdditionalParams(
              prefix + '-font-size', attrs.fontPickerDefaultFontSize),
            'is-bold' : $scope.getAdditionalParams(
              prefix + '-bold', attrs.fontPickerDefaultIsBold),
            'is-italic' : $scope.getAdditionalParams(
              prefix + '-italic', attrs.fontPickerDefaultIsItalic),
            'color' : $scope.getAdditionalParams(
              prefix + '-color', attrs.fontPickerDefaultColor)
          },
          'visibility': {
            'font' : valOrDefault(attrs.fontPickerFontVisible, true),
            'font-size' : valOrDefault(attrs.fontPickerFontSizeVisible, true),
            'variants' : valOrDefault(attrs.fontPickerVariantsVisible, true),
            'text' : valOrDefault(attrs.fontPickerTextVisible, true)
          }
        });
        //load i18n text translations after ensuring i18n has been initialized
        i18nLoader.get().then(function () {$elm.i18n();});

        $scope.$on('collectAdditionalParams', function () {
          $log.debug('Collecting params from', prefix, picker);
          $scope.setAdditionalParams(prefix + '-font', picker.getFont());
          $scope.setAdditionalParams(prefix + '-font-style', picker.getFontStyle());
          $scope.setAdditionalParams(prefix + '-font-url', picker.getfontURL());
          $scope.setAdditionalParams(prefix + '-font-size', picker.getFontSize());
          $scope.setAdditionalParams(prefix + '-bold', picker.getBold());
          $scope.setAdditionalParams(prefix + '-italic', picker.getItalic());
          $scope.setAdditionalParams(prefix + '-color', picker.getColor());
        });
      }
    };
  }]);

angular.module('risevision.widget.common', [])
  .factory('commonSettings', ['$log', function ($log) {
    $log.debug('Initializing new RiseVision common settings instance...');
    //return new RiseVision.Common.Settings();
  }]);
angular.module('risevision.widget.common')
  .factory('gadgetsApi', ["$window", function ($window) {
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

      gadgetsApi.rpc.call('', 'rscmd_saveSettings', null, {
        params: str,
        additionalParams: additionalParamsStr
      });

      $log.debug('Settings saved. ', settings);

      deferred.resolve();

      return deferred.promise;
    };

  }])

  .service('settingsGetter', ['$q', 'gadgetsApi', '$log', 'settingsParser', function ($q, gadgetsApi, $log, settingsParser) {
    this.getAdditionalParams = function () {
      var deferred = $q.defer();

      gadgetsApi.rpc.call('', 'rscmd_getAdditionalParams', function (result) {
        if(result) {
          result = settingsParser.parseAdditionalParams(result);
        }
        else {
          result = {};
        }
        $log.debug('getAdditionalParams returns ', result);
        deferred.resolve(result);
      });

      return deferred.promise;
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

    this.parseParams = function (paramsStr) {
      //TODO
      return {};
    };

    this.encodeParams = function (parmas) {
      //TODO
      return "";
    };

  }]);
