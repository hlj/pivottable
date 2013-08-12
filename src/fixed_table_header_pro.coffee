########################################################################
# A fixed table header plugins for jquery
#
# Copyright © 2013 Beta.Su (hlj8080@gmail.com)
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
########################################################################

$ = jQuery

$.fn.fixedTableHeaderPro = (method) ->
    defaults =
        width: '100%'
        height: '100%'
        fixedCol: false
        fixedFooter: false # reserved, not implemented
        cloneEvents: false # if true then clone the table header event handlers, but the performance will be significantly reduced
    
    methods =
        # internal helper function
        _colSpanInRow: (tr, tags='td') ->
            c = 0
            tr.find(tags).each ->
                c += this.colSpan
            return c
            
        _scrollBarWidth: ->
            document.body.style.overflow = 'hidden' 
            width = document.body.clientWidth
            document.body.style.overflow = 'scroll' 
            width -= document.body.clientWidth
            if (!width) then width = document.body.offsetWidth - document.body.clientWidth
            document.body.style.overflow = ''
            return width 
            
        # public function
        
        # This function remove all components of fixed header, reset the source table    
        destroy: ->
            wrapper = this.parents('.fthp-wrapper-main')
            if wrapper.size() > 0
                console.log wrapper
                wrapper.parent().append(this)
                wrapper.remove()
                
        # Create a fixed header table from source table
        create: (srcTable, settings) ->
            @destroy.apply(srcTable)
            
            srcWidth = srcTable.width() 
            srcHeight  = srcTable.height()
            scrollWidth = @_scrollBarWidth()
            
            settings.width = srcWidth + scrollWidth if settings.width > srcWidth
            settings.height = srcHeight + scrollWidth if settings.height > srcHeight
            
            
            srcTable.width(srcWidth).height(srcHeight)
            # create main wrapper
            defaultCss = {"overflow": "hidden", "margin": "0px", "padding": "0px", "border-width": "0px"}
            wrapper = $("<div class='fthp-wrapper-main'>")
                .css($.extend {}, defaultCss, {"position": "relative"})
                .width(settings.width)
                .height(settings.height)
            parent = srcTable.parent()
            
            # create source table wrapper
            wrapper.append wrapperTable = $("<div class='fthp-wrapper-table'>").append(srcTable)
                .css( $.extend {}, defaultCss,
                          "overflow": "scroll", 
                          "width": settings.width, #-(if fixedColTable? then fixedColTable.width else 0), 
                          "height": settings.height, #-fixedRowTable.height,
                          "position": "relative", "z-index": "35" )
                .on 'scroll', ->
                    t = $(this)
                    wrapperRow.scrollLeft(t.scrollLeft())
                    wrapperCol.scrollTop(t.scrollTop()) if wrapperCol?                  
            parent.append(wrapper)
            
            # create a clone for fixed row header
            fixedRowTable = srcTable.clone settings.cloneEvents,settings.cloneEvents
            fixedRowTable.addClass('fthp-header').height('auto')
            # clear other elements
            fixedRowTable.find('tbody, tfoot').empty()
            # reserve th's width
            srcThs = srcTable.find('thead th')
            fixedRowTable.find('thead th').attr('id',null).each (i,v)-> 
                srcTh = srcThs.eq(i)
                $(this).width(srcTh.width()+1)
                    .height(srcTh.height())
                    .css('minWidth', srcTh.width())
                    .css('maxWidth',srcTh.width())
                unless /webkit/.test(navigator.userAgent.toLowerCase())
                    $(this).outerWidth(srcTh.outerWidth()+1)
                        .innerWidth(srcTh.innerWidth()+1)
            # create and append row wrapper
            wrapper.append wrapperRow = $("<div class='fthp-wrapper-row'>").append(fixedRowTable)
                .css($.extend {}, defaultCss, {"width": settings.width - scrollWidth, "position": "relative", "z-index": "45"})
            
            
            # if need fix cols, create a clone
            if settings.fixedCol
                fixedColTable = srcTable.clone settings.cloneEvents, settings.cloneEvents
                fixedColTable.addClass('fthp-columns').width('auto')
                # reserve th's width and heigth
                srcThs = srcTable.find('th')
                fixedColTable.find('th').attr('id',null).each (i,v)->
                    srcTh = srcThs.eq(i)
                    $(this).width(srcTh.width()+1).height(srcTh.height()).css('minWidth', srcTh.width())
                # remove other elements
                fixedColTable.find('td').remove()
                
                # For normal first line of the table has most cell
                maxColSpans = @_colSpanInRow fixedColTable.find('tbody tr:first'), 'th'
                
                # consider the cell which rowspan > 1
                rowSpans = [] 
                fixedColTable.find('thead tr').each ->
                    currentColSpans = 0
                    $('th', this).each ->
                        currentColSpans += cs[1] for cs in rowSpans when cs[0] > 0
                        currentColSpans += this.colSpan
                        rowSpans.push [this.rowSpan, this.colSpan] if this.rowSpan > 1
                        if currentColSpans >= maxColSpans
                            $(this).nextAll().remove()
                            return false
                    # reduce the rowspan when over a tr 
                    cs[0]-- for cs in rowSpans when cs[0] > 0
                    
                # create a clone for fixed corner
                fixedCornerTable = fixedColTable.clone settings.cloneEvents, settings.cloneEvents
                fixedCornerTable.addClass('fthp-corner').width('auto').height('auto')
                fixedCornerTable.find('tbody tr, tfoot tr').remove()
                
                # create col and corner wrapper
                wrapper.append wrapperCol = $("<div class='fthp-wrapper-col'>").append(fixedColTable)
                    .css($.extend {}, defaultCss,{"height": settings.height - scrollWidth, "position": "relative", "z-index": "40"});
                wrapper.append wrapperCorner = $("<div class='fthp-wrapper-corner'>").append(fixedCornerTable)
                    .css($.extend {}, defaultCss,{"position": "relative", "z-index": "50"});
           
            wrapperCol.width(fixedColTable.width()+2) if wrapperCol?
            wrapperCorner.width(fixedCornerTable.width()+2).height(fixedCornerTable.height()+2) if wrapperCorner?
            fixedRowTable.css('maxWidth',srcWidth).width(srcWidth)
            wrapper.children().offset wrapper.offset()
                
    if typeof method == 'string' and methods[method]?
        methods[method].apply(this)
    else if typeof method == 'object' and method.constructor == Object
        settings = $.extend defaults, method
        methods.create(this, settings)
    else
        console.log "Error: #{method} is not a valid argument!"
    return this