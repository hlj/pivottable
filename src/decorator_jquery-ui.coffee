$ = jQuery
pvt = window.PivotTable

decorators = pvt.decorators
decorators['jquery-ui'] =
    PivotTable: (ele) ->
        ele.addClass('table table-bordered')