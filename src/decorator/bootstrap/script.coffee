$ = jQuery
pvt = window.PivotTable
t = pvt.i18n.t

decorators = pvt.decorators
decorators['bootstrap'] =
    pivotTable:  ->
        this.addClass('table table-bordered')
        return this
        
    pivotUITable:  ->
        this.addClass('table')
        return this
        
    createRendererSelector: (rendererNames, change_callback) ->
        controls = $("<td colspan='2' align='center'>")
        nav = $(
            """
            <div class="navbar">
            <div class="navbar-inner">
            <a class="brand" href="#">#{t "Effects:"}</a>
            <ul class="nav">
            <li>
                <div class='btn-group' data-toggle='buttons-radio'></div>
            </li>
            </ul>
            </div>
            </div>
            """)
        

        controls.append nav
        container = nav.find(".btn-group")
                
        for x in rendererNames
            btn = $("<button  type='button' class='btn' id='renderers_#{x.replace(/\s/g, "")}'>#{t x}</button>").data('val', x)
            container.append btn                          
        this.append $("<tr>").append controls
        
        $('button', container).bind "click", ->
             container.data('selected', $(this).data('val'))
             change_callback()
        return container
    
    createColList: (tblCols, hiddenAxes, axisValues, change_callback) ->
        colList = $("<td colspan='2' id='unused' class='pvtHorizList pvtAxisContainer'>")
        nav = $(
            """
            <div class="navbar">
            <div class="navbar-inner">
            <a class="brand" href="#">#{t "Fields:"}</a>
            </div>
            </div>
            """)
        colList.append nav
        container = nav.find(".navbar-inner")

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
                if numKeys > 20
                    valueList.append $("<li>").text t "(too many to list)"
                else
                    li = $('<li>')
                    li.append $("<button class='btn btn-min'>").text(t "Select All").bind "click", ->
                        valueList.find("input").attr "checked", true
                    li.append $("<button class='btn btn-min'>").text(t "Select None").bind "click", ->
                        valueList.find("input").attr "checked", false
                    valueList.append li
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
                    
                # colLabel.bind "dblclick", (e) ->
  #                   valueList.css(left: e.pageX, top: e.pageY).toggle()
  #                   valueList.bind "click", (e) -> e.stopPropagation()
  #                   $(document).one "click", ->
  #                       refresh()
  #                       valueList.toggle()    
        this.append $("<tr>").append colList      
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
            $("#renderers_#{this.rendererName.replace(/\s/g, "")}").trigger('click') 
            
    bindEvents: ->
        updateLabel = ->
            $('#rows, #cols').find('.btn').addClass('btn-success').find('.icon-filter').addClass('icon-white')
            $('#unused').find('.btn').removeClass('btn-success').find('.icon-filter').removeClass('icon-white')
        $(".pvtAxisContainer").sortable()
            .on 'sortstop', updateLabel
        updateLabel()
               
