(function() {
  var $, decorators, pvt, t,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty;

  $ = jQuery;

  pvt = window.PivotTable;

  t = pvt.i18n.t;

  decorators = pvt.decorators;

  decorators['bootstrap'] = {
    pivotTable: function() {
      this.addClass('table table-bordered pvt-table-bt');
      return this;
    },
    pivotUITable: function() {
      this.addClass('pvt-ui-table-bt');
      return this;
    },
    createRendererSelector: function(rendererNames, change_callback) {
      var btn, container, controls, x, _i, _len;
      controls = $("<td colspan='2' class='pvt-axis-container-bt' align='left'>");
      container = $("<div class='btn-group' data-toggle='buttons-radio'>");
      controls.append(container);
      for (_i = 0, _len = rendererNames.length; _i < _len; _i++) {
        x = rendererNames[_i];
        btn = $("<button  type='button' class='btn' id='renderers_" + (x.replace(/\s/g, "")) + "'>" + (t(x)) + "</button>").data('val', x);
        container.append(btn);
      }
      this.append($("<tr>").append(controls));
      $('button', container).bind("click", function() {
        container.data('selected', $(this).data('val'));
        return change_callback();
      });
      return container;
    },
    createColList: function(tblCols, hiddenAxes, axisValues, change_callback) {
      var c, colList, container, _i, _len;
      container = colList = $("<td colspan='2' id='unused' class='pvtHorizList pvtAxisContainer'>");
      for (_i = 0, _len = tblCols.length; _i < _len; _i++) {
        c = tblCols[_i];
        if (__indexOf.call(hiddenAxes, c) < 0) {
          (function(c) {
            var btn, filterItem, k, keys, li, numKeys, v, valueList, _j, _len1, _ref;
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
            btn = $("    \n <div class='btn-group data-label' id='axis_" + (c.replace(/\s/g, "")) + "'>\n     <span class='btn handle'>" + c + "</span>\n     <button class=\"btn dropdown-toggle\" data-toggle=\"dropdown\">\n         <span class=\"icon-filter\"></span>\n     </button>\n </div>\n").data('name', c);
            valueList = $("<ul class='dropdown-menu'>");
            valueList.append($("<li>").text(t("values for axis", numKeys, c)));
            valueList.append("<li class='divider'></li>");
            if (numKeys > 20) {
              valueList.append($("<li>").text(t("(too many to list)")));
            } else {
              li = $('<li>');
              li.append($("<button class='btn btn-mini'>").text(t("Select All")).bind("click", function() {
                return valueList.find("input").attr("checked", true);
              }));
              li.append($("<button class='btn btn-mini'>").text(t("Select None")).bind("click", function() {
                return valueList.find("input").attr("checked", false);
              }));
              valueList.append(li);
              valueList.append("<li class='divider'></li>");
              _ref = keys.sort();
              for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                k = _ref[_j];
                v = axisValues[c][k];
                filterItem = $("<label>");
                filterItem.append($("<input type='checkbox' class='pvtFilter'>").attr("checked", true).data("filter", [c, k]));
                filterItem.append($("<span>").text("" + k + " (" + v + ")"));
                valueList.append($("<li>").append(filterItem));
              }
            }
            $('li', valueList).click(function(e) {
              return event.stopPropagation();
            });
            btn.find('.dropdown-toggle').on('click.filter', function() {
              return $(document).one('click.filter', function() {
                console.log('click');
                return change_callback();
              });
            });
            return container.append(btn.append(valueList));
          })(c);
        }
      }
      this.append($("<tr>").append(colList));
      return container;
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
        return $("#renderers_" + (this.rendererName.replace(/\s/g, ""))).trigger('click');
      }
    },
    afterCreated: function() {
      var classes, k, pvtTable, uiTable, updateLabel, v;
      pvtTable = $('.pvtTable');
      uiTable = this;
      classes = {
        ".pvtColLabel": "pvt-col-label-bt",
        ".pvtTotalLabel": "pvt-total-label-bt",
        ".pvtTotal": "pvt-total-bt",
        ".pvtGrandTotal": "pvt-grand-total-bt",
        ".pvtAxisContainer": "pvt-axis-container-bt",
        ".pvtHorizList": "pvt-horiz-list-bt"
      };
      for (k in classes) {
        v = classes[k];
        uiTable.find(k).addClass(v);
      }
      updateLabel = function() {
        $('#rows, #cols, #vals').find('.btn-group > .btn').addClass('btn-success').find('.icon-filter').addClass('icon-white');
        return $('#unused').find('.btn-group > .btn').removeClass('btn-success').find('.icon-filter').removeClass('icon-white');
      };
      $(".pvtAxisContainer").sortable().on('sortstop', updateLabel);
      return updateLabel();
    }
  };

}).call(this);
