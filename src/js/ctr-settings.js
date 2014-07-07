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
