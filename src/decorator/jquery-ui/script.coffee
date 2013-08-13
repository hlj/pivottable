$ = jQuery
pvt = window.PivotTable

decorators = pvt.decorators
decorators['jquery-ui'] =
    pivotTable: (ele) ->
        ele.addClass('table table-bordered')
        
    pivotUITable: (ele) ->
        ele.addClass('table table-bordered')