(function() {
  var $, i18n, pvt;

  $ = jQuery;

  pvt = window.PivotTable;

  i18n = pvt.i18n;

  i18n["en"] = {
    "values for axis": function(args) {
      return "" + args[0] + " values for " + args[1];
    },
    "aggregator.count": "count",
    "aggregator.countUnique": "countUnique",
    "aggregator.listUnique": "listUnique",
    "aggregator.intSum": "intSum",
    "aggregator.sum": "Sum",
    "aggregator.average": "average",
    "aggregator.sumOverSum": "sumOverSum",
    "aggregator.ub80": "ub80",
    "aggregator.lb80": "lb80",
    "charts title": function(args) {
      if (args[0] == null) {
        return args[1];
      } else if (args[1] == null) {
        return args[0];
      } else {
        return "" + args[0] + " by " + args[1];
      }
    }
  };

  i18n["zh"] = i18n["zh-CN"] = {
    "Row Barchart": "行内柱状图",
    "Heatmap": "热点表",
    "Row Heatmap": "行热点表",
    "Col Heatmap": "列热点表",
    "null": "空值",
    "Totals": "合计",
    "None": "无",
    "Select None": "清除选择",
    "Select All": "选择全部",
    "Effects:": "特效:",
    "Fields:": "字段:",
    'Export': "导出",
    "(too many to list)": "(列表太长)",
    "values for axis": function(args) {
      return "共 " + args[0] + " 类 " + args[1];
    },
    "aggregator.count": "计数",
    "aggregator.countUnique": "非重复值计数",
    "aggregator.listUnique": "单行显示非重复值",
    "aggregator.intSum": "累加(取整)",
    "aggregator.sum": "累加",
    "aggregator.average": "平均值",
    "aggregator.sumOverSum": "累加并求比例",
    "aggregator.ub80": "累加并求比例2",
    "aggregator.lb80": "累加并求比例3",
    "charts title": function(args) {
      if (args[0] == null) {
        return args[1];
      } else if (args[1] == null) {
        return args[0];
      } else {
        return "" + args[1] + " 之 " + args[0];
      }
    },
    "Line chart": "折线图",
    "Bar chart": "柱状图",
    "Area chart": "面积图",
    "Can't show the chart, please include the ECharts or HighCharts first!": "无法显示此图表，请先引入ECharts或HighCharts组件"
  };

}).call(this);
