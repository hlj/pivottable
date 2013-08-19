(function() {
  var $, makeFlotChart, pvt, renderers, t;

  $ = jQuery;

  pvt = window.PivotTable;

  renderers = pvt.renderers;

  t = pvt.i18n.t;

  $.extend(renderers, {
    "Line chart": function(pvtData, parent) {
      return makeFlotChart(pvtData, parent, 'line');
    },
    "Bar chart": function(pvtData, parent) {
      return makeFlotChart(pvtData, parent, 'column');
    },
    "Area chart": function(pvtData, parent) {
      return makeFlotChart(pvtData, parent, 'area');
    }
  });

  makeFlotChart = function(pvtData, parent, type, option) {
    var agg, colKey, colKeys, data, dataArray, dataObj, defaultOpt, groupByTitle, h, hAxisTitle, headers, height, rowKey, rowKeys, title, width, wrapper, _i, _j, _len, _len1;
    width = $(window).width() / 1.2;
    height = $(window).height() / 1.4;
    wrapper = $("<div class='pvt-flot-chart'>").width(width).height(height);
    parent.empty().append(wrapper);
    rowKeys = pivotData.getRowKeys();
    if (rowKeys.length === 0) {
      rowKeys.push([]);
    }
    colKeys = pivotData.getColKeys();
    if (colKeys.length === 0) {
      colKeys.push([]);
    }
    headers = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = rowKeys.length; _i < _len; _i++) {
        h = rowKeys[_i];
        _results.push(h.join("-"));
      }
      return _results;
    })();
    dataArray = [];
    for (_i = 0, _len = colKeys.length; _i < _len; _i++) {
      colKey = colKeys[_i];
      dataObj = {};
      dataObj.name = colKey.join("-");
      data = [];
      for (_j = 0, _len1 = rowKeys.length; _j < _len1; _j++) {
        rowKey = rowKeys[_j];
        agg = pivotData.getAggregator(rowKey, colKey);
        if (agg.value() != null) {
          data.push(agg.value());
        } else {
          data.push(null);
        }
      }
      dataObj.data = data;
      dataArray.push(dataObj);
    }
    hAxisTitle = pivotData.colVars.join("-");
    groupByTitle = pivotData.rowVars.join("-");
    title = t("charts title", hAxisTitle, groupByTitle);
    defaultOpt = {
      chart: {
        type: type
      },
      title: {
        text: title
      },
      xAxis: {
        categories: headers,
        title: {
          text: groupByTitle
        }
      },
      yAxis: {
        title: {
          text: null
        }
      },
      legend: {
        align: 'right',
        layout: 'vertical',
        verticalAlign: 'top',
        y: 50,
        padding: 10,
        itemStyle: {
          lineHeight: '20px',
          padding: '5px'
        }
      },
      credits: {
        enabled: false
      },
      series: dataArray
    };
    $.extend(defaultOpt, option);
    wrapper.highcharts(defaultOpt);
    return wrapper;
  };

}).call(this);
