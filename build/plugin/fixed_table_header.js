(function() {
  var $, pvt;

  $ = jQuery;

  pvt = window.PivotTable;

  pvt.plugins['fixedTableHeader'] = function(table, options) {
    var _ref;
    if ((table != null) && ((_ref = table[0]) != null ? _ref.tagName : void 0) === 'TABLE') {
      return table.fixedTableHeaderPro(options);
    }
  };

}).call(this);
