(function (window){
  "use strict";

  window.google = {
    visualization: {
      Query: function (url, options) {
        var queryInstance = {
          abort: function () {},
          setRefreshInterval: function (seconds) {},
          setTimeout: function (seconds) {},
          setQuery: function (str) {},
          send: function (callback) {
            if (callback) {
              var queryResponseInstance = {
                getDataTable: function () {
                  var cols =[
                      {"id":"A","label":"Column 1","type":"string"},
                      {"id":"B","label":"Column 2","type":"number"},
                      {"id":"C","label":"Column 3","type":"date"}
                    ],
                    rows = [
                      [
                        "test 1",
                        345453,
                        "Date(2013, 7, 10)"
                      ],[
                        "test 2",
                        6565.67,
                        "Date(2014, 2, 24)"
                      ],[
                        "test 3",
                        56,
                        "Date(2005, 10, 29)"
                      ]
                    ];

                  var dataTableInstance = {
                    getColumnId: function (columnIndex) {
                      return cols[columnIndex].id;
                    },
                    getColumnLabel: function (columnIndex) {
                      return cols[columnIndex].label;
                    },
                    getColumnType: function (columnIndex) {
                      return cols[columnIndex].type;
                    },
                    getNumberOfColumns: function () {
                      return cols.length;
                    },
                    getNumberOfRows: function () {
                      return rows.length;
                    },
                    getValue: function (rowIndex, columnIndex) {
                      return rows[rowIndex][columnIndex];
                    }
                  };

                  return dataTableInstance;
                },
                getDetailedMessage: function () { return "Mock detailed message"; },
                getMessage: function () { return "Mock message" },
                getReasons: function () { return []; },
                hasWarning: function () { return false; },
                isError: function () { return false; }
              };

              setTimeout(function () {
                callback(queryResponseInstance);
              }, 50);
            }
          }
        };
        return queryInstance;
      }
    }
  };
})(window);
