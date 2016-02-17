window.result = {
    additionalParams: JSON.stringify(
      {
        "textSetting":"hello world",
        "checkboxSetting":true,
        "textAreaSetting": "the quick brown fox jumps over the lazy dog"
      }
    ),
    params: "?up_textSetting1=defg"
  };

window.gadgets = {
  rpc: function (methodName, callback, params) {
    if(methodName === "rscmd_saveSettings") {
      window.result.params = params.params;
      window.result.additionalParams = params.additionalParams;
      if(callback) {
        callback(params);
      }
      else{ return params; }
    }
    else if (methodName === "rscms_closeSettings") {
      if(callback) {
        callback(true);
      }
      else {
        return true;
      }
    }
    else if (methodName === "rscmd_getAdditionalParams"){
      if(callback) {
        callback(window.result.additionalParams);
      }
    }
    else {throw "Unknown method"; }
  }
};
