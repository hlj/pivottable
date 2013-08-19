(function() {
  var $;

  $ = jQuery;

  if ($.browser == null) {
    $.browser = {
      mozilla: /mozilla/.test(navigator.userAgent.toLowerCase()) && !/webkit/.test(navigator.userAgent.toLowerCase()),
      webkit: /webkit/.test(navigator.userAgent.toLowerCase()),
      opera: /opera/.test(navigator.userAgent.toLowerCase()),
      msie: /msie/.test(navigator.userAgent.toLowerCase())
    };
  }

  $.fn.fixedTableHeaderPro = function(method) {
    var defaults, methods, settings;
    defaults = {
      width: '100%',
      height: '100%',
      fixedCol: false,
      fixedFooter: false,
      cloneEvents: false
    };
    methods = {
      _colSpanInRow: function(tr, tags) {
        var c;
        if (tags == null) {
          tags = 'td';
        }
        c = 0;
        tr.find(tags).each(function() {
          return c += this.colSpan;
        });
        return c;
      },
      _cellWidth: function(ele) {
        var bw, w;
        w = ele.width();
        bw = parseInt(ele.css('border-width')) || 1;
        if ($.browser.mozilla) {
          return w;
        } else if ($.browser.chrome) {
          return w + bw;
        } else if ($.browser.msie) {
          return w + bw + bw / 2;
        }
      },
      _eleWidth: function(ele) {
        var ow, w;
        w = ele.width();
        ow = ele.outerWidth();
        if ($.browser.mozilla) {
          return ow;
        } else {
          return ow;
        }
      },
      _scrollBarWidth: function() {
        var width;
        document.body.style.overflow = 'hidden';
        width = document.body.clientWidth;
        document.body.style.overflow = 'scroll';
        width -= document.body.clientWidth;
        if (!width) {
          width = document.body.offsetWidth - document.body.clientWidth;
        }
        document.body.style.overflow = '';
        return width;
      },
      destroy: function() {
        var wrapper;
        wrapper = this.parents('.fthp-wrapper-main');
        if (wrapper.size() > 0) {
          wrapper.parent().append(this);
          return wrapper.remove();
        }
      },
      create: function(srcTable, settings) {
        var bw, defaultCss, fixedColTable, fixedCornerTable, fixedRowTable, maxColSpans, parent, rowSpans, scrollWidth, self, srcAdjustWidth, srcHeight, srcOuterHeight, srcOuterWidth, srcThs, srcWidth, wrapper, wrapperCol, wrapperCorner, wrapperRow, wrapperTable;
        self = this;
        this.destroy.apply(srcTable);
        srcWidth = srcTable.width();
        srcHeight = srcTable.height();
        srcOuterWidth = srcTable.outerWidth(true);
        srcOuterHeight = srcTable.outerHeight(true);
        srcAdjustWidth = this._eleWidth(srcTable);
        scrollWidth = this._scrollBarWidth();
        if ($.isNumeric(settings.width)) {
          settings.width = parseInt(settings.width);
          if (settings.width > srcOuterWidth) {
            settings.width = srcOuterWidth + scrollWidth;
          }
        }
        if ($.isNumeric(settings.height)) {
          settings.height = parseInt(settings.height);
          if (settings.height > srcOuterHeight) {
            settings.height = srcOuterHeight + scrollWidth;
          }
        }
        srcTable.width(srcAdjustWidth).height(srcHeight);
        defaultCss = {
          "overflow": "hidden",
          "margin": "0px",
          "padding": "0px",
          "border-width": "0px"
        };
        wrapper = $("<div class='fthp-wrapper-main'>").css($.extend({}, defaultCss, {
          "position": "relative"
        })).width(settings.width).height(settings.height);
        parent = srcTable.parent();
        wrapper.append(wrapperTable = $("<div class='fthp-wrapper-table'>").append(srcTable).css($.extend({}, defaultCss, {
          "overflow": "scroll",
          "width": settings.width,
          "height": settings.height,
          "position": "relative",
          "z-index": "35"
        })).on('scroll', function() {
          var t;
          t = $(this);
          wrapperRow.scrollLeft(t.scrollLeft());
          if (typeof wrapperCol !== "undefined" && wrapperCol !== null) {
            return wrapperCol.scrollTop(t.scrollTop());
          }
        }));
        parent.append(wrapper);
        fixedRowTable = srcTable.clone(settings.cloneEvents, settings.cloneEvents);
        fixedRowTable.addClass('fthp-header').height('auto');
        fixedRowTable.find('tbody, tfoot').empty();
        srcThs = srcTable.find('thead th');
        fixedRowTable.find('thead th').attr('id', null).each(function(i, v) {
          var srcTh, w;
          srcTh = srcThs.eq(i);
          w = self._cellWidth(srcTh);
          return $(this).width(w).css('minWidth', srcTh.width()).css('maxWidth', w);
        });
        wrapper.append(wrapperRow = $("<div class='fthp-wrapper-row'>").append(fixedRowTable).css($.extend({}, defaultCss, {
          "width": settings.width - scrollWidth,
          "position": "relative",
          "z-index": "45"
        })));
        if (settings.fixedCol) {
          fixedColTable = srcTable.clone(settings.cloneEvents, settings.cloneEvents);
          fixedColTable.addClass('fthp-columns').width('auto');
          srcThs = srcTable.find('th');
          fixedColTable.find('th').attr('id', null).each(function(i, v) {
            var srcTh, w;
            srcTh = srcThs.eq(i);
            w = self._cellWidth(srcTh);
            return $(this).width(w).css('minWidth', srcTh.width()).css('maxWidth', w);
          });
          fixedColTable.find('td').remove();
          maxColSpans = this._colSpanInRow(fixedColTable.find('tbody tr:first'), 'th');
          rowSpans = [];
          fixedColTable.find('thead tr').each(function() {
            var cs, currentColSpans, _i, _len, _results;
            currentColSpans = 0;
            $('th', this).each(function() {
              var cs, _i, _len;
              for (_i = 0, _len = rowSpans.length; _i < _len; _i++) {
                cs = rowSpans[_i];
                if (cs[0] > 0) {
                  currentColSpans += cs[1];
                }
              }
              currentColSpans += this.colSpan;
              if (this.rowSpan > 1) {
                rowSpans.push([this.rowSpan, this.colSpan]);
              }
              if (currentColSpans >= maxColSpans) {
                $(this).nextAll().remove();
                return false;
              }
            });
            _results = [];
            for (_i = 0, _len = rowSpans.length; _i < _len; _i++) {
              cs = rowSpans[_i];
              if (cs[0] > 0) {
                _results.push(cs[0]--);
              }
            }
            return _results;
          });
          fixedCornerTable = fixedColTable.clone(settings.cloneEvents, settings.cloneEvents);
          fixedCornerTable.removeClass('fthp-columns').addClass('fthp-corner').width('auto').height('auto');
          fixedCornerTable.find('tbody tr, tfoot tr').remove();
          wrapper.append(wrapperCol = $("<div class='fthp-wrapper-col'>").append(fixedColTable).css($.extend({}, defaultCss, {
            "height": settings.height - scrollWidth,
            "position": "relative",
            "z-index": "40"
          })));
          wrapper.append(wrapperCorner = $("<div class='fthp-wrapper-corner'>").append(fixedCornerTable).css($.extend({}, defaultCss, {
            "position": "relative",
            "z-index": "50"
          })));
        }
        bw = parseInt(fixedColTable.find('th:first').css('border-width')) || 1;
        if (wrapperCol != null) {
          wrapperCol.width(fixedColTable.width() + bw * 2);
        }
        if (wrapperCorner != null) {
          wrapperCorner.width(fixedCornerTable.width() + bw * 2).height(fixedCornerTable.height() + bw * 2);
        }
        fixedRowTable.css('maxWidth', srcWidth).width(srcWidth);
        return wrapper.children().offset(wrapper.offset());
      }
    };
    if (typeof method === 'string' && (methods[method] != null)) {
      methods[method].apply(this);
    } else if (typeof method === 'object' && method.constructor === Object) {
      settings = $.extend(defaults, method);
      methods.create(this, settings);
    } else {
      console.log("Error: " + method + " is not a valid argument!");
    }
    return this;
  };

}).call(this);
