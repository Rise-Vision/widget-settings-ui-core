/* jshint expr:true */
'use strict';

describe('Settings UI', function() {
  beforeEach(module('risevision.widget.common'));

  describe('settingsSaver', function () {
    it('should exist', function(done) {
      inject(function (settingsSaver) {
        expect(settingsSaver).be.defined;
        done();
      });
    });
  });
});
