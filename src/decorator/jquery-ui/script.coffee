$ = jQuery
pvt = window.PivotTable
t = pvt.i18n.t

decorators = pvt.decorators
decorators['jquery-ui'] =
    pivotTable:  ->
        this.addClass('pvt-table-ju')
        return this
        
    pivotUITable:  ->
        this.addClass('pvt-ui-table-ju')
        return this
        
    createRendererSelector: (rendererNames, change_callback) ->
        controls = $("<td colspan='2' align='center'>")
        form = $("<form>").addClass("form-inline")
        controls.append form

        form.append $("<strong>").text(t "Effects:")
        for x in rendererNames
            radio = $("<input type='radio' name='renderers' id='renderers_#{x.replace(/\s/g, "")}'>")
              .css("margin-left":"15px", "margin-right": "5px").val(x)
            radio.attr("checked", "checked") if x=="None"
            form.append(radio).append $("<label class='checkbox inline' for='renderers_#{x.replace(/\s/g, "")}'>").text(t x)
        this.append $("<tr>").append controls
        $('input[name=renderers]', form).bind "change", ->
             form.data('selected', $(this).val())
             change_callback()
        return form
    
    createColList: (tblCols, hiddenAxes, axisValues, change_callback) ->
        colList = $("<td colspan='2' id='unused' class='pvtAxisContainer pvtHorizList'>")

        for c in tblCols when c not in hiddenAxes
            do (c) ->
                #numKeys = Object.keys(axisValues[c]).length
                keys = (k for own k,v of axisValues[c])
                numKeys = keys.length
                colLabel = $("<nobr class='handle'>").text(c)
                valueList = $("<div>")
                    .css
                        "z-index": 100
                        "width": "280px"
                        "height": "350px"
                        "overflow": "scroll"
                        "border": "1px solid gray"
                        "background": "white"
                        "display": "none"
                        "position": "absolute"
                        "padding": "20px"
                valueList.append $("<strong>").text t("values for axis",numKeys, c)
                if numKeys > 20
                    valueList.append $("<p>").text t "(too many to list)"
                else
                    btns = $("<p>")
                    btns.append $("<button>").text(t "Select All").bind "click", ->
                        valueList.find("input").attr "checked", true
                    btns.append $("<button>").text(t "Select None").bind "click", ->
                        valueList.find("input").attr "checked", false
                    valueList.append btns
                    for k in keys.sort()
                         v = axisValues[c][k]
                         filterItem = $("<label>")
                         filterItem.append $("<input type='checkbox' class='pvtFilter'>")
                            .attr("checked", true).data("filter", [c,k])
                         filterItem.append $("<span>").text "#{k} (#{v})"
                         valueList.append $("<p>").append(filterItem)
                colLabel.bind "dblclick", (e) ->
                    valueList.css(left: e.pageX, top: e.pageY).toggle()
                    valueList.bind "click", (e) -> e.stopPropagation()
                    $(document).one "click", ->
                        change_callback()
                        valueList.toggle()
                colList.append $("<li class='data-label' id='axis_#{c.replace(/\s/g, "")}'>").data('name',c)
                    .append(colLabel).append(valueList)
        this.append $("<tr>").append colList
        return colList
    
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
            $("#renderers_#{this.rendererName.replace(/\s/g, "")}").attr('checked',true).trigger('change')
        
    afterCreated: ->
        pvtTable = $('.pvtTable')
        uiTable = this
        classes =
            ".pvtColLabel": "pvt-col-label-ju"
            ".pvtTotalLabel": "pvt-total-label-ju"
            ".pvtTotal": "pvt-total-ju"
            ".pvtGrandTotal": "pvt-grand-total-ju"
            ".pvtAxisContainer": "pvt-axis-container-ju"
            ".pvtHorizList": "pvt-horiz-list-ju"
        for k, v of classes
            uiTable.find(k).addClass(v)    
        
        
        

        