(function() {
  var $, pvt;

  $ = jQuery;

  pvt = window.PivotTable;

  pvt.plugins['fixedTableHeader'] = function(table, options) {
    console.log(table);
    return table.fixedTableHeaderPro(options);
  };

}).call(this);
