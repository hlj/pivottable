$ = jQuery
pvt = window.PivotTable
t = pvt.i18n.t

decorators = pvt.decorators
decorators['bootstrap'] =
    pivotTable:  ->
        this.addClass('table table-bordered pvt-table-bt')
        return this
        
    pivotUITable:  ->
        this.addClass('pvt-ui-table-bt')
        return this
        
    createRendererSelector: (rendererNames, change_callback) ->
        controls = $("<td colspan='1' class='pvt-axis-container-bt' align='center'>")
        container = $ "<select id='renderer' class='renderer-sel-bt'>"
        

        controls.append container 
                
        for x in rendererNames
            container.append $ "<option value='#{x}'>#{t x}</option>"                          
        this.append $("<tr>").append controls
        
        container.on 'change', ->
             container.data('selected', $(this).val())
             change_callback()
        return container
    
    createColList: (tblCols, hiddenAxes, axisValues, change_callback) ->
        container = colList = $("<td colspan='1' id='unused' class='pvtHorizList pvtAxisContainer'>")
        for c in tblCols when c not in hiddenAxes
            do (c) ->
                keys = (k for own k,v of axisValues[c])
                numKeys = keys.length
                btn = $(
                    """    
                    <div class='btn-group data-label' id='axis_#{c.replace(/\s/g, "")}'>
                        <span class='btn handle'>#{c}</span>
                        <button class="btn dropdown-toggle" data-toggle="dropdown">
                            <span class="icon-filter"></span>
                        </button>
                    </div>
                   
                    """
                ).data('name', c)
                valueList = $("<ul class='dropdown-menu'>")
                valueList.append $("<li>").text t("values for axis",numKeys, c)
                valueList.append "<li class='divider'></li>"
                if numKeys > 20
                    valueList.append $("<li>").text t "(too many to list)"
                else
                    li = $('<li>')
                    li.append $("<button class='btn btn-mini'>").text(t "Select All").bind "click", ->
                        valueList.find("input").attr "checked", true
                    li.append $("<button class='btn btn-mini'>").text(t "Select None").bind "click", ->
                        valueList.find("input").attr "checked", false
                    valueList.append li
                    valueList.append "<li class='divider'></li>"
                    for k in keys.sort()
                         v = axisValues[c][k]
                         filterItem = $("<label>")
                         filterItem.append $("<input type='checkbox' class='pvtFilter'>")
                            .attr("checked", true).data("filter", [c,k])
                         filterItem.append $("<span>").text "#{k} (#{v})"
                         valueList.append $("<li>").append(filterItem)
                                                 
                $('li', valueList).click (e) -> event.stopPropagation()
                
                btn.find('.dropdown-toggle').on 'click.filter', ->
                    $(document).one 'click.filter', ->
                        console.log 'click'
                        change_callback()
                
                container.append btn.append valueList
                      
        this.find("tr:first").append colList 
        return container
    
    createAggregatorMenu: (aggregators, change_callback) ->
        aggregator = $("<select id='aggregator'>")
            .css("margin-bottom", "5px")
        for own x of aggregators
            aggregator.append $("<option>").val(x).text(t "aggregator.#{x}")
        aggregator.bind "change", change_callback #capture reference
          
        return aggregator
        
    initialUI: ->
        for x in this.cols
            $("#cols").append $("#axis_#{x.replace(/\s/g, "")}")
        for x in this.rows
            $("#rows").append $("#axis_#{x.replace(/\s/g, "")}")
        for x in this.vals
            $("#vals").append $("#axis_#{x.replace(/\s/g, "")}")
        if this.aggregatorName?
            $("#aggregator").val opts.aggregatorName
        if this.rendererName?
            $("#renderer").val(this.rendererName).trigger('change')
            
    afterCreated: ->
        pvtTable = $('.pvtTable')
        uiTable = this
        classes =
            ".pvtColLabel": "pvt-col-label-bt"
            ".pvtTotalLabel": "pvt-total-label-bt"
            ".pvtTotal": "pvt-total-bt"
            ".pvtGrandTotal": "pvt-grand-total-bt"
            ".pvtAxisContainer": "pvt-axis-container-bt"
            ".pvtHorizList": "pvt-horiz-list-bt"
        for k, v of classes
            uiTable.find(k).addClass(v)
            
        updateLabel = ->
            $('#rows, #cols, #vals').find('.btn-group > .btn').addClass('btn-info').find('.icon-filter').addClass('icon-white')
            $('#unused').find('.btn-group > .btn').removeClass('btn-info').find('.icon-filter').removeClass('icon-white')
        $(".pvtAxisContainer").sortable()
            .on 'sortstop', updateLabel
        updateLabel()
               
