(function() {
  var $, decorators, pvt, t,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty;

  $ = jQuery;

  pvt = window.PivotTable;

  t = pvt.i18n.t;

  decorators = pvt.decorators;

  decorators['jquery-ui'] = {
    pivotTable: function() {
      this.addClass('pvt-table-ju');
      return this;
    },
    pivotUITable: function() {
      this.addClass('pvt-ui-table-ju');
      return this;
    },
    createRendererSelector: function(rendererNames, change_callback) {
      var controls, form, radio, x, _i, _len;
      controls = $("<td colspan='2' align='center'>");
      form = $("<form>").addClass("form-inline");
      controls.append(form);
      form.append($("<strong>").text(t("Effects:")));
      for (_i = 0, _len = rendererNames.length; _i < _len; _i++) {
        x = rendererNames[_i];
        radio = $("<input type='radio' name='renderers' id='renderers_" + (x.replace(/\s/g, "")) + "'>").css({
          "margin-left": "15px",
          "margin-right": "5px"
        }).val(x);
        if (x === "None") {
          radio.attr("checked", "checked");
        }
        form.append(radio).append($("<label class='checkbox inline' for='renderers_" + (x.replace(/\s/g, "")) + "'>").text(t(x)));
      }
      this.append($("<tr>").append(controls));
      $('input[name=renderers]', form).bind("change", function() {
        form.data('selected', $(this).val());
        return change_callback();
      });
      return form;
    },
    createColList: function(tblCols, hiddenAxes, axisValues, change_callback) {
      var c, colList, _i, _len;
      colList = $("<td colspan='2' id='unused' class='pvtAxisContainer pvtHorizList'>");
      for (_i = 0, _len = tblCols.length; _i < _len; _i++) {
        c = tblCols[_i];
        if (__indexOf.call(hiddenAxes, c) < 0) {
          (function(c) {
            var btns, colLabel, filterItem, k, keys, numKeys, v, valueList, _j, _len1, _ref;
            keys = (function() {
              var _ref, _results;
              _ref = axisValues[c];
              _results = [];
              for (k in _ref) {
                if (!__hasProp.call(_ref, k)) continue;
                v = _ref[k];
                _results.push(k);
              }
              return _results;
            })();
            numKeys = keys.length;
            colLabel = $("<nobr class='handle'>").text(c);
            valueList = $("<div>").css({
              "z-index": 100,
              "width": "280px",
              "height": "350px",
              "overflow": "scroll",
              "border": "1px solid gray",
              "background": "white",
              "display": "none",
              "position": "absolute",
              "padding": "20px"
            });
            valueList.append($("<strong>").text(t("values for axis", numKeys, c)));
            if (numKeys > 20) {
              valueList.append($("<p>").text(t("(too many to list)")));
            } else {
              btns = $("<p>");
              btns.append($("<button>").text(t("Select All")).bind("click", function() {
                return valueList.find("input").attr("checked", true);
              }));
              btns.append($("<button>").text(t("Select None")).bind("click", function() {
                return valueList.find("input").attr("checked", false);
              }));
              valueList.append(btns);
              _ref = keys.sort();
              for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                k = _ref[_j];
                v = axisValues[c][k];
                filterItem = $("<label>");
                filterItem.append($("<input type='checkbox' class='pvtFilter'>").attr("checked", true).data("filter", [c, k]));
                filterItem.append($("<span>").text("" + k + " (" + v + ")"));
                valueList.append($("<p>").append(filterItem));
              }
            }
            colLabel.bind("dblclick", function(e) {
              valueList.css({
                left: e.pageX,
                top: e.pageY
              }).toggle();
              valueList.bind("click", function(e) {
                return e.stopPropagation();
              });
              return $(document).one("click", function() {
                change_callback();
                return valueList.toggle();
              });
            });
            return colList.append($("<li class='data-label' id='axis_" + (c.replace(/\s/g, "")) + "'>").data('name', c).append(colLabel).append(valueList));
          })(c);
        }
      }
      this.append($("<tr>").append(colList));
      return colList;
    },
    createAggregatorMenu: function(aggregators, change_callback) {
      var aggregator, x;
      aggregator = $("<select id='aggregator'>").css("margin-bottom", "5px");
      for (x in aggregators) {
        if (!__hasProp.call(aggregators, x)) continue;
        aggregator.append($("<option>").val(x).text(t("aggregator." + x)));
      }
      aggregator.bind("change", change_callback);
      return aggregator;
    },
    initialUI: function() {
      var x, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      _ref = this.cols;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        x = _ref[_i];
        $("#cols").append($("#axis_" + (x.replace(/\s/g, ""))));
      }
      _ref1 = this.rows;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        x = _ref1[_j];
        $("#rows").append($("#axis_" + (x.replace(/\s/g, ""))));
      }
      _ref2 = this.vals;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        x = _ref2[_k];
        $("#vals").append($("#axis_" + (x.replace(/\s/g, ""))));
      }
      if (this.aggregatorName != null) {
        $("#aggregator").val(opts.aggregatorName);
      }
      if (this.rendererName != null) {
        return $("#renderers_" + (this.rendererName.replace(/\s/g, ""))).attr('checked', true).trigger('change');
      }
    },
    afterCreated: function() {
      var classes, k, pvtTable, uiTable, v, _results;
      pvtTable = $('.pvtTable');
      uiTable = this;
      classes = {
        ".pvtColLabel": "pvt-col-label-ju",
        ".pvtTotalLabel": "pvt-total-label-ju",
        ".pvtTotal": "pvt-total-ju",
        ".pvtGrandTotal": "pvt-grand-total-ju",
        ".pvtAxisContainer": "pvt-axis-container-ju",
        ".pvtHorizList": "pvt-horiz-list-ju"
      };
      _results = [];
      for (k in classes) {
        v = classes[k];
        _results.push(uiTable.find(k).addClass(v));
      }
      return _results;
    }
  };

}).call(this);
