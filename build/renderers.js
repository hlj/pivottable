(function() {
  var $, pvt, renderers;

  $ = jQuery;

  pvt = window.PivotTable;

  renderers = pvt.renderers;

  $.extend(renderers, {
    "Row Barchart": function(pvtData) {
      return pvt.buildPivotTable(pvtData).barchart();
    },
    "Heatmap": function(pvtData) {
      return pvt.buildPivotTable(pvtData).heatmap();
    },
    "Row Heatmap": function(pvtData) {
      return pvt.buildPivotTable(pvtData).heatmap("rowheatmap");
    },
    "Col Heatmap": function(pvtData) {
      return pvt.buildPivotTable(pvtData).heatmap("colheatmap");
    }
  });

  /*
  Heatmap post-processing
  */


  $.fn.heatmap = function(scope) {
    var colorGen, heatmapper, i, j, numCols, numRows, _i, _j, _ref,
      _this = this;
    if (scope == null) {
      scope = "heatmap";
    }
    _ref = this.data("dimensions"), numRows = _ref[0], numCols = _ref[1];
    colorGen = function(color, min, max) {
      var hexGen;
      hexGen = (function() {
        switch (color) {
          case "red":
            return function(hex) {
              return "ff" + hex + hex;
            };
          case "green":
            return function(hex) {
              return "" + hex + "ff" + hex;
            };
          case "blue":
            return function(hex) {
              return "" + hex + hex + "ff";
            };
        }
      })();
      return function(x) {
        var hex, intensity;
        intensity = 255 - Math.round(255 * (x - min) / (max - min));
        hex = intensity.toString(16).split(".")[0];
        if (hex.length === 1) {
          hex = 0 + hex;
        }
        return hexGen(hex);
      };
    };
    heatmapper = function(scope, color) {
      var colorFor, forEachCell, values;
      forEachCell = function(f) {
        return _this.find(scope).each(function() {
          var x;
          x = $(this).data("value");
          if ((x != null) && isFinite(x)) {
            return f(x, $(this));
          }
        });
      };
      values = [];
      forEachCell(function(x) {
        return values.push(x);
      });
      colorFor = colorGen(color, Math.min.apply(Math, values), Math.max.apply(Math, values));
      return forEachCell(function(x, elem) {
        return elem.css("background-color", "#" + colorFor(x));
      });
    };
    switch (scope) {
      case "heatmap":
        heatmapper(".pvtVal", "red");
        break;
      case "rowheatmap":
        for (i = _i = 0; 0 <= numRows ? _i < numRows : _i > numRows; i = 0 <= numRows ? ++_i : --_i) {
          heatmapper(".pvtVal.row" + i, "red");
        }
        break;
      case "colheatmap":
        for (j = _j = 0; 0 <= numCols ? _j < numCols : _j > numCols; j = 0 <= numCols ? ++_j : --_j) {
          heatmapper(".pvtVal.col" + j, "red");
        }
    }
    heatmapper(".pvtTotal.rowTotal", "red");
    heatmapper(".pvtTotal.colTotal", "red");
    return this;
  };

  /*
  Barchart post-processing
  */


  $.fn.barchart = function() {
    var barcharter, i, numCols, numRows, _i, _ref,
      _this = this;
    _ref = this.data("dimensions"), numRows = _ref[0], numCols = _ref[1];
    barcharter = function(scope) {
      var forEachCell, max, scaler, values;
      forEachCell = function(f) {
        return _this.find(scope).each(function() {
          var x;
          x = $(this).data("value");
          if ((x != null) && isFinite(x)) {
            return f(x, $(this));
          }
        });
      };
      values = [];
      forEachCell(function(x) {
        return values.push(x);
      });
      max = Math.max.apply(Math, values);
      scaler = function(x) {
        return 100 * x / (1.4 * max);
      };
      return forEachCell(function(x, elem) {
        var text, wrapper;
        text = elem.text();
        wrapper = $("<div>").css({
          "position": "relative",
          "height": "55px"
        });
        wrapper.append($("<div>").css({
          "position": "absolute",
          "bottom": 0,
          "left": 0,
          "right": 0,
          "height": scaler(x) + "%",
          "background-color": "gray"
        }));
        wrapper.append($("<div>").text(text).css({
          "position": "relative",
          "padding-left": "5px",
          "padding-right": "5px"
        }));
        return elem.css({
          "padding": 0,
          "padding-top": "5px",
          "text-align": "center"
        }).html(wrapper);
      });
    };
    for (i = _i = 0; 0 <= numRows ? _i < numRows : _i > numRows; i = 0 <= numRows ? ++_i : --_i) {
      barcharter(".pvtVal.row" + i);
    }
    barcharter(".pvtTotal.colTotal");
    return this;
  };

}).call(this);
