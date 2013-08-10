(function() {
  var $, decorators, pvt;

  $ = jQuery;

  pvt = window.PivotTable;

  decorators = pvt.decorators;

  decorators['jquery-ui'] = {
    PivotTable: function(ele) {
      return ele.addClass('table table-bordered');
    }
  };

}).call(this);
