$ = jQuery
pvt = window.PivotTable

renderers = pvt.renderers
t = pvt.i18n.t
    
makeDatas = (pvtData, parent) ->
    width = $(window).width() / 1.2
    height =  $(window).height() / 1.4
    wrapper = $("<div class='pvt-table-chart'>").width(width).height(height)
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
            else data.push 0
        dataObj.data = data
        dataArray.push dataObj
    
    #title = vAxisTitle = pivotData.aggregator().label
    hAxisTitle = pivotData.colVars.join("-")
    groupByTitle = pivotData.rowVars.join("-")
    title = t "charts title", hAxisTitle, groupByTitle
    
    return (
        wrapper: wrapper
        xCategories: headers
        dataArray: dataArray
        title: title
        yTitle: hAxisTitle
        xTitle: groupByTitle
    )
        

makeEChart = (pvtData, parent, type, option) -> 
    datas = makeDatas pvtData, parent
    legends = []
    for d in datas.dataArray
        legends.push d.name
        d.type = if type is 'area' then 'line' else type
        d.itemStyle = 
            normal: {}
        if type is 'area'
            d.itemStyle.normal.areaStyle = {type: 'default'}
        else
            d.itemStyle.normal.lineStyle = { width:2}
        
    defaultOpt =
        animationDuration: 1500
        title:
            text: datas.title
            x: 'center'
        tooltip:
            trigger: 'item'
        legend:
            data: legends
            orient: 'vertical'
            x: 'right'
            y: 80
        toolbox:
            show : true
            feature :
                mark : true
                dataView : 
                    readOnly: true
                restore : true
                saveAsImage : true
        calculable : true
        xAxis :
            name: '子'
            type : 'category'
            boundaryGap : type is 'bar'
            data : datas.xCategories
            axisLabel:
                interval: 'auto'
        yAxis :
            type : 'value'
            name:  datas.yTitle
            splitArea : 
                show : true
        series : datas.dataArray
        
    $.extend defaultOpt, option
    
    require ['echarts/echarts'], (echarts) ->
        pvtChart = echarts.init datas.wrapper[0]
        pvtChart.setOption(defaultOpt)
    
    
    return datas.wrapper
    
makeHighChart = (pvtData, parent, type, option) ->
    type = 'column' if type is 'bar'
    datas = makeDatas pvtData, parent
    defaultOpt = 
        chart:
            type:  type
        title:
            text: datas.title
        xAxis:
            categories: datas.xCategories
            title: 
                text: datas.xTitle
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
            
        series: datas.dataArray
    
    $.extend defaultOpt, option
    datas.wrapper.highcharts defaultOpt
    
    return datas.wrapper
    

makeChart = if $.fn.highcharts? then makeHighChart else makeEChart
$.extend renderers,
    "Line chart": (pvtData, parent) -> makeChart(pvtData, parent, 'line')
    "Bar chart":   (pvtData, parent) -> makeChart(pvtData, parent, 'bar')
    "Area chart":  (pvtData, parent) -> makeChart(pvtData, parent, 'area')