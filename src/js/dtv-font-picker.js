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
