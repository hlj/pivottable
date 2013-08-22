(function() {
  var $, makeChart, makeDatas, makeEChart, makeHighChart, pvt, renderers, t;

  $ = jQuery;

  pvt = window.PivotTable;

  renderers = pvt.renderers;

  t = pvt.i18n.t;

  makeDatas = function(pvtData, parent) {
    var agg, colKey, colKeys, data, dataArray, dataObj, groupByTitle, h, hAxisTitle, headers, height, rowKey, rowKeys, title, width, wrapper, _i, _j, _len, _len1;
    width = $(window).width() / 1.2;
    height = $(window).height() / 1.4;
    wrapper = $("<div class='pvt-table-chart'>").width(width).height(height);
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
          data.push(0);
        }
      }
      dataObj.data = data;
      dataArray.push(dataObj);
    }
    hAxisTitle = pivotData.colVars.join("-");
    groupByTitle = pivotData.rowVars.join("-");
    title = t("charts title", hAxisTitle, groupByTitle);
    return {
      wrapper: wrapper,
      xCategories: headers,
      dataArray: dataArray,
      title: title,
      yTitle: hAxisTitle,
      xTitle: groupByTitle
    };
  };

  makeEChart = function(pvtData, parent, type, option) {
    var d, datas, defaultOpt, legends, pvtChart, _i, _len, _ref;
    datas = makeDatas(pvtData, parent);
    legends = [];
    _ref = datas.dataArray;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      d = _ref[_i];
      legends.push(d.name);
      d.type = type === 'area' ? 'line' : type;
      d.itemStyle = {
        normal: {}
      };
      if (type === 'area') {
        d.itemStyle.normal.areaStyle = {
          type: 'default'
        };
      } else {
        d.itemStyle.normal.lineStyle = {
          width: 2
        };
      }
    }
    defaultOpt = {
      animationDuration: 1500,
      title: {
        text: datas.title,
        x: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        data: legends,
        orient: 'vertical',
        x: 'right',
        y: 80
      },
      toolbox: {
        show: true,
        feature: {
          mark: true,
          dataView: {
            readOnly: true
          },
          restore: true,
          saveAsImage: true
        }
      },
      calculable: true,
      xAxis: {
        name: '子',
        type: 'category',
        boundaryGap: type === 'bar',
        data: datas.xCategories,
        axisLabel: {
          interval: 'auto'
        }
      },
      yAxis: {
        type: 'value',
        name: datas.yTitle,
        splitArea: {
          show: true
        }
      },
      series: datas.dataArray
    };
    $.extend(defaultOpt, option);
    pvtChart = window.echarts.init(datas.wrapper[0]);
    pvtChart.setOption(defaultOpt);
    return datas.wrapper;
  };

  makeHighChart = function(pvtData, parent, type, option) {
    var datas, defaultOpt;
    if (type === 'bar') {
      type = 'column';
    }
    datas = makeDatas(pvtData, parent);
    defaultOpt = {
      chart: {
        type: type
      },
      title: {
        text: datas.title
      },
      xAxis: {
        categories: datas.xCategories,
        title: {
          text: datas.xTitle
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
      series: datas.dataArray
    };
    $.extend(defaultOpt, option);
    datas.wrapper.highcharts(defaultOpt);
    return datas.wrapper;
  };

  makeChart = function() {
    var fn;
    if ($.fn.highcharts != null) {
      fn = makeHighChart;
    }
    if (window.echarts != null) {
      fn = makeEChart;
    }
    if (fn != null) {
      return fn.apply(this, arguments);
    } else {
      return alert(t("Can't show the chart, please include the ECharts or HighCharts first!"));
    }
  };

  $.extend(renderers, {
    "Line chart": function(pvtData, parent) {
      return makeChart(pvtData, parent, 'line');
    },
    "Bar chart": function(pvtData, parent) {
      return makeChart(pvtData, parent, 'bar');
    },
    "Area chart": function(pvtData, parent) {
      return makeChart(pvtData, parent, 'area');
    }
  });

}).call(this);
