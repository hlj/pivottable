$ = jQuery
pvt = window.PivotTable

decorators = pvt.decorators
decorators['default'] =
    PivotTable: (ele) ->
        $('.pvtVal, .pvtTotal', ele).hover(
            -> 
                sels = ".#{$.trim($(this)[0].className.replace('pvtVal','')).split(' ').join(',.')}"
                console.log sels
                $(sels, ele).addClass('pvtVal-cross')
                $(this).addClass('pvtVal-em')
            ,
            ->  
                sels = "th .#{$.trim($(this)[0].className.replace('pvtVal','')).split(' ').join(',.')}"
                $(sels, ele).removeClass('pvtVal-cross')
                $(this).removeClass('pvtVal-em')
        )
