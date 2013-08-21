(function() {
  var $, btoa, format, pvt, t, template, toBase64, uri;

  $ = jQuery;

  pvt = window.PivotTable;

  t = pvt.i18n.t;

  btoa = window.btoa || window.base64.encode;

  uri = 'data:application/vnd.ms-excel;base64,';

  template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>';

  toBase64 = function(s) {
    return btoa(unescape(encodeURIComponent(s)));
  };

  format = function(s, c) {
    return s.replace(/{(\w+)}/g, function(m, p) {
      return c[p];
    });
  };

  pvt.plugins['exportToExcel'] = function(table, options) {
    var btn, default_opts, _ref;
    default_opts = {
      sheetName: 'WorkSheet',
      container: null
    };
    $.extend(default_opts, options);
    $('.btn-export-to-excel').remove();
    if ((table != null) && ((_ref = table[0]) != null ? _ref.tagName : void 0) === 'TABLE') {
      if (default_opts.container == null) {
        default_opts.container = $('#cols');
      }
      btn = $("<a class='pull-right btn-export-to-excel' style='line-height:30px' href='#'>" + (t('Export')) + " <i class='icon-share'></i></button>").on('click', function() {
        var ctx;
        ctx = {
          worksheet: default_opts.sheetName,
          table: table.html()
        };
        return window.location.href = uri + toBase64(format(template, ctx));
      });
      return default_opts.container.append(btn);
    }
  };

}).call(this);
