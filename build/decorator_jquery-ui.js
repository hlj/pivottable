(function() {
  var $, decorators, pvt;

  $ = jQuery;

  pvt = window.PivotTable;

  decorators = pvt.decorators;

  decorators['jquery-ui'] = {
    pivotTable: function(ele) {
      return ele.addClass('table table-bordered');
    },
    pivotUITable: function(ele) {
      return ele.addClass('table table-bordered');
    }
  };

}).call(this);
