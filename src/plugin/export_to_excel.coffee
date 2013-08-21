#################################################
# Refer to the http://jsfiddle.net/lesson8/wVejP/
#################################################

$ = jQuery
pvt = window.PivotTable
t = pvt.i18n.t

btoa = window.btoa || window.base64.encode
uri =  'data:application/vnd.ms-excel;base64,'
template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
toBase64 = (s) ->  btoa(unescape(encodeURIComponent(s)))
format = (s, c) ->  s.replace(/{(\w+)}/g, (m,p) -> return c[p])

pvt.plugins['exportToExcel'] = (table, options) ->
    default_opts = 
        sheetName: 'WorkSheet'
        container: null
    
    $.extend default_opts, options
    $('.btn-export-to-excel').remove()
        
    if table? and table[0]?.tagName is 'TABLE'
        unless default_opts.container?
            default_opts.container = $('#cols')
        btn = $("<a class='pull-right btn-export-to-excel' style='line-height:30px' href='#'>#{t 'Export'} <i class='icon-share'></i></button>")
            .on 'click', ->
                ctx = 
                    worksheet: default_opts.sheetName
                    table: table.html()
                window.location.href = uri + toBase64(format(template,ctx))    
        default_opts.container.append(btn)
        