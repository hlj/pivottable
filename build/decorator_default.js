(function() {
  var $, decorators, pvt;

  $ = jQuery;

  pvt = window.PivotTable;

  decorators = pvt.decorators;

  decorators['default'] = {
    PivotTable: function(ele) {
      return $('.pvtVal, .pvtTotal', ele).hover(function() {
        var sels;
        sels = "." + ($.trim($(this)[0].className.replace('pvtVal', '')).split(' ').join(',.'));
        console.log(sels);
        $(sels, ele).addClass('pvtVal-cross');
        return $(this).addClass('pvtVal-em');
      }, function() {
        var sels;
        sels = "th ." + ($.trim($(this)[0].className.replace('pvtVal', '')).split(' ').join(',.'));
        $(sels, ele).removeClass('pvtVal-cross');
        return $(this).removeClass('pvtVal-em');
      });
    }
  };

}).call(this);
