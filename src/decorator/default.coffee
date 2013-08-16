$ = jQuery
pvt = window.PivotTable

decorators = pvt.decorators
decorators['default'] =
    pivotTable:  ->
        # change style of row/col header and cell when mouse over the cell
        $('.pvtVal, .pvtTotal', this).hover(
            -> 
                sels = ".#{$.trim($(this)[0].className.replace('pvtVal','')).split(' ').join(',.')}"
                $('.pvtTable').find(sels).addClass('pvtVal-cross')
                $(this).addClass('pvtVal-em')
            ,
            ->  
                sels = "th .#{$.trim($(this)[0].className.replace('pvtVal','')).split(' ').join(',.')}"
                $('.pvtTable').find(sels).removeClass('pvtVal-cross')
                $(this).removeClass('pvtVal-em')
        )
        return this
