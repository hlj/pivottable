$ = jQuery
pvt = window.PivotTable

pvt.plugins['fixedTableHeader'] = (table, options) ->
    if table? and table[0]?.tagName is 'TABLE'
        table.fixedTableHeaderPro(options)