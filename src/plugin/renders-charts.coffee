$ = jQuery
pvt = window.PivotTable

renderers = pvt.renderers
t = pvt.i18n.t

$.extend renderers,
    "Line chart": (pvtData, parent) -> makeChart(pvtData, parent, 'line')
    "Bar chart":   (pvtData, parent) -> makeChart(pvtData, parent, 'column')
    "Area chart":  (pvtData, parent) -> makeChart(pvtData, parent, 'area')
    

makeChart = (pvtData, parent, type, option) ->
    width = $(window).width() / 1.2
    height =  $(window).height() / 1.4
    wrapper = $("<div class='pvt-flot-chart'>").width(width).height(height)
    parent.empty().append(wrapper)
    
    rowKeys = pivotData.getRowKeys()
    rowKeys.push [] if rowKeys.length == 0
    colKeys = pivotData.getColKeys()
    colKeys.push [] if colKeys.length == 0
    
    headers = (h.join("-") for h in rowKeys)
    dataArray = []
    
    for colKey in colKeys
        dataObj = {}
        dataObj.name = colKey.join("-")
        data = []
        for rowKey in rowKeys
            agg = pivotData.getAggregator(rowKey, colKey)
            if agg.value()?
                data.push agg.value()
            else data.push null
        dataObj.data = data
        dataArray.push dataObj
    
    #title = vAxisTitle = pivotData.aggregator().label
    hAxisTitle = pivotData.colVars.join("-")
    groupByTitle = pivotData.rowVars.join("-")
    title = t "charts title", hAxisTitle, groupByTitle
    
    defaultOpt = 
        chart:
            type:  type
        title:
            text: title
        xAxis:
            categories: headers
            title: 
                text: groupByTitle
        yAxis:
            title:
                text: null
        legend:
            align: 'right'
            layout: 'vertical'
            verticalAlign: 'top'
            y: 50
            padding: 10
            itemStyle:
                lineHeight: '20px'
                padding: '5px'
        credits:
            enabled: false
            
        series: dataArray
    
    $.extend defaultOpt, option
    wrapper.highcharts defaultOpt
    
    return wrapper
    # 
    # headers.unshift ""
    # 
    # numCharsInHAxis = 0
    # dataArray = [headers]
    # for colKey in colKeys
    #     row = [colKey.join("-")]
    #     numCharsInHAxis += row[0].length
    #     for rowKey in rowKeys
    #         agg = pivotData.getAggregator(rowKey, colKey)
    #         if agg.value()?
    #             row.push agg.value()
    #         else row.push null
    #     dataArray.push row
    # 
    # title = vAxisTitle = pivotData.aggregator().label
    # hAxisTitle = pivotData.colVars.join("-")
    # title += " vs #{hAxisTitle}" if hAxisTitle != ""
    # groupByTitle = pivotData.rowVars.join("-")
    # title += " by #{groupByTitle}" if groupByTitle != ""
    # 
    # JSON.stringify(dataArray)
    # options = 
    #     title: title
    #     hAxis: {title: hAxisTitle, slantedText: numCharsInHAxis > 50}
    #     vAxis: {title: vAxisTitle}
    # 
    # if dataArray[0].length == 2 and dataArray[0][1] ==  ""
    #     options.legend = position: "none"
    # 
    # options[k] = v for k, v of extraOptions
    # 
    # dataTable = google.visualization.arrayToDataTable(dataArray)
    # 
    # result = $("<div style='width: 100%; height: 100%;'>")
    # wrapper = new google.visualization.ChartWrapper {dataTable, chartType, options}
    # wrapper.draw(result[0]) 
    # result.bind "dblclick", -> 
    #     editor = new google.visualization.ChartEditor()
    #     google.visualization.events.addListener editor, 'ok', -> 
    #         editor.getChartWrapper().draw(result[0])
    #     editor.openDialog(wrapper)
    # return result