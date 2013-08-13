$ = jQuery
pvt = window.PivotTable

pvt.plugins['fixedTableHeader'] = (table, options) ->
    console.log table
    table.fixedTableHeaderPro(options)