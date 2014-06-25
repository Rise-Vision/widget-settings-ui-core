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
