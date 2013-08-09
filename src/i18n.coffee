$ = jQuery
pvt = window.PivotTable

i18n = pvt.i18n
i18n["zh"] = i18n["zh-CN"] =
    "Row Barchart": "行内柱状图"
    "Heatmap":      "热点图"
    "Row Heatmap":  "行热点图"
    "Col Heatmap":  "列热点图"
    "null":         "空值"
    "Totals":       "合计"
    "None":         "无"
    "Select None":  "清除选择"
    "Select All":   "选择全部"
    "Effects:":     "效果:"
    "(too many to list)":       "(列表太长)"
    "values for axis":          (args) -> "共 #{args[0]} 类 #{args[1]}" 
    "aggregator.count":         "计数"
    "aggregator.countUnique":   "非重复值计数"  
    "aggregator.listUnique":    "单行显示非重复值"  
    "aggregator.intSum":        "累加(取整)"  
    "aggregator.sum":           "累加"  
    "aggregator.average":       "平均值"  
    "aggregator.sumOverSum":    "累加并求比例"  
    "aggregator.ub80":          "累加并求比例2"  
    "aggregator.lb80":          "累加并求比例3"