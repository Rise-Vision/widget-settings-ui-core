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
