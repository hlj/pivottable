(function() {
  var $, PivotData, addCommas, aggregatorTemplates, aggregators, buildPivotData, buildPivotTable, convertToArray, decorators, deriveAttributes, derivers, forEachRow, i18n, numberFormat, plugins, renderers, spanSize, t,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = jQuery;

  /*
  Utilities
  */


  addCommas = function(nStr) {
    var rgx, x, x1, x2;
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  };

  numberFormat = function(sigfig, scaler) {
    if (sigfig == null) {
      sigfig = 3;
    }
    if (scaler == null) {
      scaler = 1;
    }
    return function(x) {
      if (x === 0 || isNaN(x) || !isFinite(x)) {
        return "";
      } else {
        return addCommas((scaler * x).toFixed(sigfig));
      }
    };
  };

  aggregatorTemplates = {
    sum: function(sigfig, scaler) {
      if (sigfig == null) {
        sigfig = 3;
      }
      if (scaler == null) {
        scaler = 1;
      }
      return function(_arg) {
        var field;
        field = _arg[0];
        return function() {
          return {
            sum: 0,
            push: function(row) {
              if (!isNaN(parseFloat(row[field]))) {
                return this.sum += parseFloat(row[field]);
              }
            },
            value: function() {
              return this.sum;
            },
            format: numberFormat(sigfig, scaler)
          };
        };
      };
    },
    average: function(sigfig, scaler) {
      if (sigfig == null) {
        sigfig = 3;
      }
      if (scaler == null) {
        scaler = 1;
      }
      return function(_arg) {
        var field;
        field = _arg[0];
        return function() {
          return {
            sum: 0,
            len: 0,
            push: function(row) {
              if (!isNaN(parseFloat(row[field]))) {
                this.sum += parseFloat(row[field]);
                return this.len++;
              }
            },
            value: function() {
              return this.sum / this.len;
            },
            format: numberFormat(sigfig, scaler)
          };
        };
      };
    },
    sumOverSum: function(sigfig, scaler) {
      if (sigfig == null) {
        sigfig = 3;
      }
      if (scaler == null) {
        scaler = 1;
      }
      return function(_arg) {
        var denom, num;
        num = _arg[0], denom = _arg[1];
        return function() {
          return {
            sumNum: 0,
            sumDenom: 0,
            push: function(row) {
              if (!isNaN(parseFloat(row[num]))) {
                this.sumNum += parseFloat(row[num]);
              }
              if (!isNaN(parseFloat(row[denom]))) {
                return this.sumDenom += parseFloat(row[denom]);
              }
            },
            value: function() {
              return this.sumNum / this.sumDenom;
            },
            format: numberFormat(sigfig, scaler)
          };
        };
      };
    },
    sumOverSumBound80: function(sigfig, scaler, upper) {
      if (sigfig == null) {
        sigfig = 3;
      }
      if (scaler == null) {
        scaler = 1;
      }
      if (upper == null) {
        upper = true;
      }
      return function(_arg) {
        var denom, num;
        num = _arg[0], denom = _arg[1];
        return function() {
          return {
            sumNum: 0,
            sumDenom: 0,
            push: function(row) {
              if (!isNaN(parseFloat(row[num]))) {
                this.sumNum += parseFloat(row[num]);
              }
              if (!isNaN(parseFloat(row[denom]))) {
                return this.sumDenom += parseFloat(row[denom]);
              }
            },
            value: function() {
              var sign;
              sign = upper ? 1 : -1;
              return (0.821187207574908 / this.sumDenom + this.sumNum / this.sumDenom + 1.2815515655446004 * sign * Math.sqrt(0.410593603787454 / (this.sumDenom * this.sumDenom) + (this.sumNum * (1 - this.sumNum / this.sumDenom)) / (this.sumDenom * this.sumDenom))) / (1 + 1.642374415149816 / this.sumDenom);
            },
            format: numberFormat(sigfig, scaler)
          };
        };
      };
    }
  };

  aggregators = {
    count: function() {
      return function() {
        return {
          count: 0,
          push: function() {
            return this.count++;
          },
          value: function() {
            return this.count;
          },
          format: numberFormat(0)
        };
      };
    },
    countUnique: function(_arg) {
      var field;
      field = _arg[0];
      return function() {
        return {
          uniq: [],
          push: function(row) {
            var _ref;
            if (_ref = row[field], __indexOf.call(this.uniq, _ref) < 0) {
              return this.uniq.push(row[field]);
            }
          },
          value: function() {
            return this.uniq.length;
          },
          format: numberFormat(0)
        };
      };
    },
    listUnique: function(_arg) {
      var field;
      field = _arg[0];
      return function() {
        return {
          uniq: [],
          push: function(row) {
            var _ref;
            if (_ref = row[field], __indexOf.call(this.uniq, _ref) < 0) {
              return this.uniq.push(row[field]);
            }
          },
          value: function() {
            return this.uniq.join(", ");
          },
          format: function(x) {
            return x;
          }
        };
      };
    },
    intSum: aggregatorTemplates.sum(0),
    sum: aggregatorTemplates.sum(3),
    average: aggregatorTemplates.average(3),
    sumOverSum: aggregatorTemplates.sumOverSum(3),
    ub80: aggregatorTemplates.sumOverSumBound80(3, 1, true),
    lb80: aggregatorTemplates.sumOverSumBound80(3, 1, false)
  };

  renderers = {};

  derivers = {
    bin: function(selector, binWidth) {
      var select;
      if ("string" === typeof selector) {
        select = function(x) {
          return x[selector];
        };
      } else {
        select = selector;
      }
      return function(row) {
        return "" + (select(row) - select(row) % binWidth);
      };
    }
  };

  i18n = {
    current: null,
    ln: function() {
      var lstr, lstrs, _ref, _ref1;
      if (i18n.current == null) {
        lstr = window.navigator.userLanguage || window.navigator.language;
        i18n.current = i18n[lstr];
        if (i18n.current == null) {
          lstrs = lstr.split('-');
          if (lstrs.length === 2) {
            lstrs[1] = lstrs[1].toUpperCase();
          }
          i18n.current = (_ref = (_ref1 = i18n[lstrs.join('-')]) != null ? _ref1 : i18n[lstrs[0]]) != null ? _ref : i18n["en"];
        }
      }
      return i18n.current;
    },
    t: function() {
      var args, f, str, _ref;
      str = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      f = (_ref = i18n.ln()) != null ? _ref[str] : void 0;
      if (f != null) {
        if (Object.prototype.toString.call(f) === '[object Function]') {
          return f(args);
        } else {
          return f;
        }
      } else {
        return str;
      }
    }
  };

  t = i18n.t;

  decorators = {
    style: 'jquery-ui',
    decorate: function() {
      var datas, element, r, target, _ref, _ref1, _ref2;
      element = arguments[0], target = arguments[1], datas = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      r = (_ref = decorators["default"][target]) != null ? _ref.apply(element, datas) : void 0;
      return (_ref1 = decorators[decorators.style]) != null ? (_ref2 = _ref1[target]) != null ? _ref2.apply(r || element, datas) : void 0 : void 0;
    }
  };

  plugins = {};

  $.pivotUtilities = {
    aggregatorTemplates: aggregatorTemplates,
    aggregators: aggregators,
    renderers: renderers,
    derivers: derivers,
    i18n: i18n,
    decorators: decorators,
    plugins: plugins
  };

  /*
  functions for accessing input
  */


  deriveAttributes = function(row, derivedAttributes, f) {
    var k, v, _ref;
    for (k in derivedAttributes) {
      v = derivedAttributes[k];
      row[k] = (_ref = v(row)) != null ? _ref : row[k];
    }
    for (k in row) {
      if (!__hasProp.call(row, k)) continue;
      if (row[k] == null) {
        row[k] = t("null");
      }
    }
    return f(row);
  };

  forEachRow = function(input, derivedAttributes, f) {
    var addRow, compactRow, i, j, k, row, tblCols, _i, _len, _ref, _results, _results1;
    addRow = function(row) {
      return deriveAttributes(row, derivedAttributes, f);
    };
    if (Object.prototype.toString.call(input) === '[object Function]') {
      return input(addRow);
    } else if ($.isArray(input)) {
      if ($.isArray(input[0])) {
        _results = [];
        for (i in input) {
          if (!__hasProp.call(input, i)) continue;
          compactRow = input[i];
          if (!(i > 0)) {
            continue;
          }
          row = {};
          _ref = input[0];
          for (j in _ref) {
            if (!__hasProp.call(_ref, j)) continue;
            k = _ref[j];
            row[k] = compactRow[j];
          }
          _results.push(addRow(row));
        }
        return _results;
      } else {
        _results1 = [];
        for (_i = 0, _len = input.length; _i < _len; _i++) {
          row = input[_i];
          _results1.push(addRow(row));
        }
        return _results1;
      }
    } else {
      tblCols = [];
      $("thead > tr > th", input).each(function(i) {
        return tblCols.push($(this).text());
      });
      return $("tbody > tr", input).each(function(i) {
        row = {};
        $("td", this).each(function(j) {
          return row[tblCols[j]] = $(this).text();
        });
        return addRow(row);
      });
    }
  };

  convertToArray = function(input) {
    var result;
    result = [];
    forEachRow(input, {}, function(row) {
      return result.push(row);
    });
    return result;
  };

  PivotData = (function() {
    function PivotData(aggregator, colVars, rowVars) {
      this.aggregator = aggregator;
      this.colVars = colVars;
      this.rowVars = rowVars;
      this.getAggregator = __bind(this.getAggregator, this);
      this.flattenKey = __bind(this.flattenKey, this);
      this.getRowKeys = __bind(this.getRowKeys, this);
      this.getColKeys = __bind(this.getColKeys, this);
      this.sortKeys = __bind(this.sortKeys, this);
      this.arrSort = __bind(this.arrSort, this);
      this.natSort = __bind(this.natSort, this);
      this.tree = {};
      this.rowKeys = [];
      this.colKeys = [];
      this.flatRowKeys = [];
      this.flatColKeys = [];
      this.rowTotals = {};
      this.colTotals = {};
      this.allTotal = this.aggregator();
      this.sorted = false;
    }

    PivotData.prototype.natSort = function(as, bs) {
      var a, a1, b, b1, rd, rx, rz;
      rx = /(\d+)|(\D+)/g;
      rd = /\d/;
      rz = /^0/;
      if (typeof as === "number" || typeof bs === "number") {
        if (isNaN(as)) {
          return 1;
        }
        if (isNaN(bs)) {
          return -1;
        }
        return as - bs;
      }
      a = String(as).toLowerCase();
      b = String(bs).toLowerCase();
      if (a === b) {
        return 0;
      }
      if (!(rd.test(a) && rd.test(b))) {
        return (a > b ? 1 : -1);
      }
      a = a.match(rx);
      b = b.match(rx);
      while (a.length && b.length) {
        a1 = a.shift();
        b1 = b.shift();
        if (a1 !== b1) {
          if (rd.test(a1) && rd.test(b1)) {
            return a1.replace(rz, ".0") - b1.replace(rz, ".0");
          } else {
            return (a1 > b1 ? 1 : -1);
          }
        }
      }
      return a.length - b.length;
    };

    PivotData.prototype.arrSort = function(a, b) {
      return this.natSort(a.join(), b.join());
    };

    PivotData.prototype.sortKeys = function() {
      if (!this.sorted) {
        this.rowKeys.sort(this.arrSort);
        this.colKeys.sort(this.arrSort);
      }
      return this.sorted = true;
    };

    PivotData.prototype.getColKeys = function() {
      this.sortKeys();
      return this.colKeys;
    };

    PivotData.prototype.getRowKeys = function() {
      this.sortKeys();
      return this.rowKeys;
    };

    PivotData.prototype.flattenKey = function(x) {
      return x.join(String.fromCharCode(0));
    };

    PivotData.prototype.processRow = function(row) {
      var colKey, flatColKey, flatRowKey, rowKey, x;
      colKey = (function() {
        var _i, _len, _ref, _results;
        _ref = this.colVars;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          x = _ref[_i];
          _results.push(row[x]);
        }
        return _results;
      }).call(this);
      rowKey = (function() {
        var _i, _len, _ref, _results;
        _ref = this.rowVars;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          x = _ref[_i];
          _results.push(row[x]);
        }
        return _results;
      }).call(this);
      flatRowKey = this.flattenKey(rowKey);
      flatColKey = this.flattenKey(colKey);
      this.allTotal.push(row);
      if (rowKey.length !== 0) {
        if (__indexOf.call(this.flatRowKeys, flatRowKey) < 0) {
          this.rowKeys.push(rowKey);
          this.flatRowKeys.push(flatRowKey);
        }
        if (!this.rowTotals[flatRowKey]) {
          this.rowTotals[flatRowKey] = this.aggregator();
        }
        this.rowTotals[flatRowKey].push(row);
      }
      if (colKey.length !== 0) {
        if (__indexOf.call(this.flatColKeys, flatColKey) < 0) {
          this.colKeys.push(colKey);
          this.flatColKeys.push(flatColKey);
        }
        if (!this.colTotals[flatColKey]) {
          this.colTotals[flatColKey] = this.aggregator();
        }
        this.colTotals[flatColKey].push(row);
      }
      if (colKey.length !== 0 && rowKey.length !== 0) {
        if (!(flatRowKey in this.tree)) {
          this.tree[flatRowKey] = {};
        }
        if (!(flatColKey in this.tree[flatRowKey])) {
          this.tree[flatRowKey][flatColKey] = this.aggregator();
        }
        return this.tree[flatRowKey][flatColKey].push(row);
      }
    };

    PivotData.prototype.getAggregator = function(rowKey, colKey) {
      var agg, flatColKey, flatRowKey;
      flatRowKey = this.flattenKey(rowKey);
      flatColKey = this.flattenKey(colKey);
      if (rowKey.length === 0 && colKey.length === 0) {
        agg = this.allTotal;
      } else if (rowKey.length === 0) {
        agg = this.colTotals[flatColKey];
      } else if (colKey.length === 0) {
        agg = this.rowTotals[flatRowKey];
      } else {
        agg = this.tree[flatRowKey][flatColKey];
      }
      return agg != null ? agg : {
        value: (function() {
          return null;
        }),
        format: function() {
          return "";
        }
      };
    };

    return PivotData;

  })();

  buildPivotData = function(input, cols, rows, aggregator, filter, derivedAttributes) {
    var pivotData;
    pivotData = new PivotData(aggregator, cols, rows);
    forEachRow(input, derivedAttributes, function(row) {
      if (filter(row)) {
        return pivotData.processRow(row);
      }
    });
    window.pivotData = pivotData;
    return pivotData;
  };

  spanSize = function(arr, i, j) {
    var len, noDraw, stop, x, _i, _j;
    if (i !== 0) {
      noDraw = true;
      for (x = _i = 0; 0 <= j ? _i <= j : _i >= j; x = 0 <= j ? ++_i : --_i) {
        if (arr[i - 1][x] !== arr[i][x]) {
          noDraw = false;
        }
      }
      if (noDraw) {
        return -1;
      }
    }
    len = 0;
    while (i + len < arr.length) {
      stop = false;
      for (x = _j = 0; 0 <= j ? _j <= j : _j >= j; x = 0 <= j ? ++_j : --_j) {
        if (arr[i][x] !== arr[i + len][x]) {
          stop = true;
        }
      }
      if (stop) {
        break;
      }
      len++;
    }
    return len;
  };

  buildPivotTable = function(pivotData) {
    var aggregator, c, colKey, colKeys, cols, i, j, r, result, rowKey, rowKeys, rows, tbody, tfoot, th, thead, totalAggregator, tr, txt, val, x;
    cols = pivotData.colVars;
    rows = pivotData.rowVars;
    rowKeys = pivotData.getRowKeys();
    colKeys = pivotData.getColKeys();
    result = $("<table class='pvtTable'>");
    thead = $('<thead>');
    for (j in cols) {
      if (!__hasProp.call(cols, j)) continue;
      c = cols[j];
      tr = $("<tr>");
      if (parseInt(j) === 0 && rows.length !== 0) {
        tr.append($("<th>").attr("colspan", rows.length).attr("rowspan", cols.length));
      }
      tr.append($("<th class='pvtAxisLabel'>").text(c));
      for (i in colKeys) {
        if (!__hasProp.call(colKeys, i)) continue;
        colKey = colKeys[i];
        x = spanSize(colKeys, parseInt(i), parseInt(j));
        if (x !== -1) {
          th = $("<th class='pvtColLabel col" + i + "'>").text(colKey[j]).attr("colspan", x);
          if (parseInt(j) === cols.length - 1 && rows.length !== 0) {
            th.attr("rowspan", 2);
          }
          tr.append(th);
        }
      }
      if (parseInt(j) === 0) {
        tr.append($("<th class='pvtTotalLabel'>").text(t("Totals")).attr("rowspan", cols.length + (rows.length === 0 ? 0 : 1)));
      }
      thead.append(tr);
    }
    if (rows.length !== 0) {
      tr = $("<tr>");
      for (i in rows) {
        if (!__hasProp.call(rows, i)) continue;
        r = rows[i];
        tr.append($("<th class='pvtAxisLabel'>").text(r));
      }
      th = $("<th>");
      if (cols.length === 0) {
        th.addClass("pvtTotalLabel").text(t("Totals"));
      }
      tr.append(th);
      thead.append(tr);
    }
    result.append(thead);
    tbody = $('<tbody>');
    for (i in rowKeys) {
      if (!__hasProp.call(rowKeys, i)) continue;
      rowKey = rowKeys[i];
      tr = $("<tr>");
      for (j in rowKey) {
        if (!__hasProp.call(rowKey, j)) continue;
        txt = rowKey[j];
        x = spanSize(rowKeys, parseInt(i), parseInt(j));
        if (x !== -1) {
          th = $("<th class='pvtRowLabel row" + i + "'>").text(txt).attr("rowspan", x);
          if (parseInt(j) === rows.length - 1 && cols.length !== 0) {
            th.attr("colspan", 2);
          }
          tr.append(th);
        }
      }
      for (j in colKeys) {
        if (!__hasProp.call(colKeys, j)) continue;
        colKey = colKeys[j];
        aggregator = pivotData.getAggregator(rowKey, colKey);
        val = aggregator.value();
        tr.append($("<td class='pvtVal row" + i + " col" + j + "'>").text(aggregator.format(val)).data("value", val));
      }
      totalAggregator = pivotData.getAggregator(rowKey, []);
      val = totalAggregator.value();
      tr.append($("<td class='pvtTotal rowTotal row" + i + "'>").text(totalAggregator.format(val)).data("value", val).data("for", "row" + i));
      tbody.append(tr);
    }
    result.append(tbody);
    tfoot = $('<tfoot>');
    tr = $("<tr>");
    th = $("<th class='pvtTotalLabel'>").text(t("Totals"));
    th.attr("colspan", rows.length + (cols.length === 0 ? 0 : 1));
    tr.append(th);
    for (j in colKeys) {
      if (!__hasProp.call(colKeys, j)) continue;
      colKey = colKeys[j];
      totalAggregator = pivotData.getAggregator([], colKey);
      val = totalAggregator.value();
      tr.append($("<td class='pvtTotal colTotal col" + j + "'>").text(totalAggregator.format(val)).data("value", val).data("for", "col" + j));
    }
    totalAggregator = pivotData.getAggregator([], []);
    val = totalAggregator.value();
    tr.append($("<td class='pvtGrandTotal'>").text(totalAggregator.format(val)).data("value", val));
    result.append(tfoot.append(tr));
    result.data("dimensions", [rowKeys.length, colKeys.length]);
    decorators.decorate(result, 'pivotTable');
    return result;
  };

  /*
  Pivot Table
  */


  $.fn.pivot = function(input, opts) {
    var defaults, k, pivotData, pvtTable, v, _ref, _results;
    defaults = {
      cols: [],
      rows: [],
      filter: function() {
        return true;
      },
      aggregator: aggregators.count(),
      derivedAttributes: {},
      renderer: function(pivotData) {
        return buildPivotTable(pivotData);
      },
      decoratorStyle: 'jquery-ui',
      plugins: {}
    };
    opts = $.extend(defaults, opts);
    $.pivotUtilities.decorators.style = opts.decoratorStyle;
    pivotData = buildPivotData(input, opts.cols, opts.rows, opts.aggregator, opts.filter, opts.derivedAttributes);
    this.html(pvtTable = opts.renderer(pivotData));
    _ref = opts.plugins;
    _results = [];
    for (k in _ref) {
      v = _ref[k];
      _results.push($.pivotUtilities.plugins[k](pvtTable, v));
    }
    return _results;
  };

  /*
  UI code, calls pivot table above
  */


  $.fn.pivotUI = function(input, opts) {
    var aggregator, axisValues, c, defaults, k, pivotTable, refresh, rendererNames, rendererSelector, tblCols, tr1, tr2, uiTable, x, y, _i, _len, _ref;
    defaults = {
      derivedAttributes: {},
      aggregators: aggregators,
      renderers: renderers,
      hiddenAxes: [],
      decoratorStyle: 'jquery-ui',
      plugins: {},
      cols: [],
      rows: [],
      vals: []
    };
    opts = $.extend(defaults, opts);
    $.pivotUtilities.decorators.style = opts.decoratorStyle;
    refresh = function() {
      var exclusions, renderer, subopts, vals;
      subopts = {
        derivedAttributes: opts.derivedAttributes,
        decoratorStyle: opts.decoratorStyle,
        plugins: opts.plugins
      };
      subopts.cols = [];
      subopts.rows = [];
      vals = [];
      $("#rows .data-label").each(function() {
        return subopts.rows.push($(this).data('name'));
      });
      $("#cols .data-label").each(function() {
        return subopts.cols.push($(this).data('name'));
      });
      $("#vals .data-lable").each(function() {
        return vals.push($(this).data('name'));
      });
      subopts.aggregator = opts.aggregators[aggregator.val()](vals);
      exclusions = [];
      $('input.pvtFilter').not(':checked').each(function() {
        return exclusions.push($(this).data("filter"));
      });
      subopts.filter = function(row) {
        var k, v, _i, _len, _ref;
        for (_i = 0, _len = exclusions.length; _i < _len; _i++) {
          _ref = exclusions[_i], k = _ref[0], v = _ref[1];
          if (row[k] === v) {
            return false;
          }
        }
        return true;
      };
      if (rendererNames.length !== 0) {
        renderer = rendererSelector.data('selected');
        if (renderer !== "None") {
          subopts.renderer = opts.renderers[renderer];
        }
      }
      return pivotTable.pivot(input, subopts);
    };
    input = convertToArray(input);
    tblCols = (function() {
      var _ref, _results;
      _ref = input[0];
      _results = [];
      for (k in _ref) {
        if (!__hasProp.call(_ref, k)) continue;
        _results.push(k);
      }
      return _results;
    })();
    _ref = opts.derivedAttributes;
    for (c in _ref) {
      if (!__hasProp.call(_ref, c)) continue;
      if ((__indexOf.call(tblCols, c) < 0)) {
        tblCols.push(c);
      }
    }
    axisValues = {};
    for (_i = 0, _len = tblCols.length; _i < _len; _i++) {
      x = tblCols[_i];
      axisValues[x] = {};
    }
    forEachRow(input, opts.derivedAttributes, function(row) {
      var v, _base, _results;
      _results = [];
      for (k in row) {
        if (!__hasProp.call(row, k)) continue;
        v = row[k];
        if (v == null) {
          v = "null";
        }
        if ((_base = axisValues[k])[v] == null) {
          _base[v] = 0;
        }
        _results.push(axisValues[k][v]++);
      }
      return _results;
    });
    uiTable = $("<table class='pvt-ui-table' cellpadding='5'>");
    rendererNames = (function() {
      var _ref1, _results;
      _ref1 = opts.renderers;
      _results = [];
      for (x in _ref1) {
        if (!__hasProp.call(_ref1, x)) continue;
        y = _ref1[x];
        _results.push(x);
      }
      return _results;
    })();
    if (rendererNames.length !== 0) {
      rendererNames.unshift("None");
      rendererSelector = decorators.decorate(uiTable, 'createRendererSelector', rendererNames, refresh);
    }
    decorators.decorate(uiTable, 'createColList', tblCols, opts.hiddenAxes, axisValues, refresh);
    tr1 = $("<tr>");
    aggregator = decorators.decorate(tr1, 'createAggregatorMenu', opts.aggregators, refresh);
    tr1.append($("<td id='vals' class='pvtAxisContainer pvtHorizList'>").css("text-align", "center").append(aggregator).append($("<br>")));
    tr1.append($("<td id='cols' class='pvtAxisContainer pvtHorizList'>"));
    uiTable.append(tr1);
    tr2 = $("<tr>");
    tr2.append($("<td valign='top' id='rows' class='pvtAxisContainer'>"));
    pivotTable = $("<td valign='top'>");
    tr2.append(pivotTable);
    uiTable.append(tr2);
    this.html(uiTable);
    decorators.decorate(opts, 'initialUI');
    refresh();
    $(".pvtAxisContainer").sortable({
      connectWith: ".pvtAxisContainer",
      items: '.data-label',
      handle: '.handle'
    }).bind("sortstop", refresh);
    decorators.decorate(uiTable, 'bindEvents');
    return this;
  };

  window.PivotTable = $.extend($.pivotUtilities, {
    deriveAttributes: deriveAttributes,
    buildPivotData: buildPivotData,
    buildPivotTable: buildPivotTable,
    forEachRow: forEachRow,
    PivotData: PivotData
  });

}).call(this);

;(function() {
  var $, decorators, pvt;

  $ = jQuery;

  pvt = window.PivotTable;

  decorators = pvt.decorators;

  decorators['default'] = {
    pivotTable: function() {
      $('.pvtVal, .pvtTotal', this).hover(function() {
        var sels;
        sels = "." + ($.trim($(this)[0].className.replace('pvtVal', '')).split(' ').join(',.'));
        $('.pvtTable').find(sels).addClass('pvtVal-cross');
        return $(this).addClass('pvtVal-em');
      }, function() {
        var sels;
        sels = "th ." + ($.trim($(this)[0].className.replace('pvtVal', '')).split(' ').join(',.'));
        $('.pvtTable').find(sels).removeClass('pvtVal-cross');
        return $(this).removeClass('pvtVal-em');
      });
      return this;
    }
  };

}).call(this);

;(function() {
  var $, decorators, pvt, t,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty;

  $ = jQuery;

  pvt = window.PivotTable;

  t = pvt.i18n.t;

  decorators = pvt.decorators;

  decorators['bootstrap'] = {
    pivotTable: function() {
      this.addClass('table table-bordered');
      return this;
    },
    pivotUITable: function() {
      this.addClass('table');
      return this;
    },
    createRendererSelector: function(rendererNames, change_callback) {
      var btn, container, controls, nav, x, _i, _len;
      controls = $("<td colspan='2' align='center'>");
      nav = $("<div class=\"navbar\">\n<div class=\"navbar-inner\">\n<a class=\"brand\" href=\"#\">" + (t("Effects:")) + "</a>\n<ul class=\"nav\">\n<li>\n    <div class='btn-group' data-toggle='buttons-radio'></div>\n</li>\n</ul>\n</div>\n</div>");
      controls.append(nav);
      container = nav.find(".btn-group");
      for (_i = 0, _len = rendererNames.length; _i < _len; _i++) {
        x = rendererNames[_i];
        btn = $("<button  type='button' class='btn' id='renderers_" + (x.replace(/\s/g, "")) + "'>" + (t(x)) + "</button>").data('val', x);
        container.append(btn);
      }
      this.append($("<tr>").append(controls));
      $('button', container).bind("click", function() {
        container.data('selected', $(this).data('val'));
        return change_callback();
      });
      return container;
    },
    createColList: function(tblCols, hiddenAxes, axisValues, change_callback) {
      var c, colList, container, nav, _i, _len;
      colList = $("<td colspan='2' id='unused' class='pvtHorizList pvtAxisContainer'>");
      nav = $("<div class=\"navbar\">\n<div class=\"navbar-inner\">\n<a class=\"brand\" href=\"#\">" + (t("Fields:")) + "</a>\n</div>\n</div>");
      colList.append(nav);
      container = nav.find(".navbar-inner");
      for (_i = 0, _len = tblCols.length; _i < _len; _i++) {
        c = tblCols[_i];
        if (__indexOf.call(hiddenAxes, c) < 0) {
          (function(c) {
            var btn, filterItem, k, keys, li, numKeys, v, valueList, _j, _len1, _ref;
            keys = (function() {
              var _ref, _results;
              _ref = axisValues[c];
              _results = [];
              for (k in _ref) {
                if (!__hasProp.call(_ref, k)) continue;
                v = _ref[k];
                _results.push(k);
              }
              return _results;
            })();
            numKeys = keys.length;
            btn = $("    \n <div class='btn-group data-label' id='axis_" + (c.replace(/\s/g, "")) + "'>\n     <span class='btn handle'>" + c + "</span>\n     <button class=\"btn dropdown-toggle\" data-toggle=\"dropdown\">\n         <span class=\"icon-filter\"></span>\n     </button>\n </div>\n").data('name', c);
            valueList = $("<ul class='dropdown-menu'>");
            valueList.append($("<li>").text(t("values for axis", numKeys, c)));
            if (numKeys > 20) {
              valueList.append($("<li>").text(t("(too many to list)")));
            } else {
              li = $('<li>');
              li.append($("<button class='btn btn-min'>").text(t("Select All")).bind("click", function() {
                return valueList.find("input").attr("checked", true);
              }));
              li.append($("<button class='btn btn-min'>").text(t("Select None")).bind("click", function() {
                return valueList.find("input").attr("checked", false);
              }));
              valueList.append(li);
              _ref = keys.sort();
              for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                k = _ref[_j];
                v = axisValues[c][k];
                filterItem = $("<label>");
                filterItem.append($("<input type='checkbox' class='pvtFilter'>").attr("checked", true).data("filter", [c, k]));
                filterItem.append($("<span>").text("" + k + " (" + v + ")"));
                valueList.append($("<li>").append(filterItem));
              }
            }
            $('li', valueList).click(function(e) {
              return event.stopPropagation();
            });
            btn.find('.dropdown-toggle').on('click.filter', function() {
              return $(document).one('click.filter', function() {
                console.log('click');
                return change_callback();
              });
            });
            return container.append(btn.append(valueList));
          })(c);
        }
      }
      this.append($("<tr>").append(colList));
      return container;
    },
    createAggregatorMenu: function(aggregators, change_callback) {
      var aggregator, x;
      aggregator = $("<select id='aggregator'>").css("margin-bottom", "5px");
      for (x in aggregators) {
        if (!__hasProp.call(aggregators, x)) continue;
        aggregator.append($("<option>").val(x).text(t("aggregator." + x)));
      }
      aggregator.bind("change", change_callback);
      return aggregator;
    },
    initialUI: function() {
      var x, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      _ref = this.cols;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        x = _ref[_i];
        $("#cols").append($("#axis_" + (x.replace(/\s/g, ""))));
      }
      _ref1 = this.rows;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        x = _ref1[_j];
        $("#rows").append($("#axis_" + (x.replace(/\s/g, ""))));
      }
      _ref2 = this.vals;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        x = _ref2[_k];
        $("#vals").append($("#axis_" + (x.replace(/\s/g, ""))));
      }
      if (this.aggregatorName != null) {
        $("#aggregator").val(opts.aggregatorName);
      }
      if (this.rendererName != null) {
        return $("#renderers_" + (this.rendererName.replace(/\s/g, ""))).trigger('click');
      }
    },
    bindEvents: function() {
      var updateLabel;
      updateLabel = function() {
        $('#rows, #cols').find('.btn').addClass('btn-success').find('.icon-filter').addClass('icon-white');
        return $('#unused').find('.btn').removeClass('btn-success').find('.icon-filter').removeClass('icon-white');
      };
      $(".pvtAxisContainer").sortable().on('sortstop', updateLabel);
      return updateLabel();
    }
  };

}).call(this);

;(function() {
  var $, decorators, pvt, t,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = {}.hasOwnProperty;

  $ = jQuery;

  pvt = window.PivotTable;

  t = pvt.i18n.t;

  decorators = pvt.decorators;

  decorators['jquery-ui'] = {
    pivotTable: function() {
      this.addClass('table table-bordered');
      return this;
    },
    pivotUITable: function() {
      this.addClass('table table-bordered');
      return this;
    },
    createRendererSelector: function(rendererNames, change_callback) {
      var controls, form, radio, x, _i, _len;
      controls = $("<td colspan='2' align='center'>");
      form = $("<form>").addClass("form-inline");
      controls.append(form);
      form.append($("<strong>").text(t("Effects:")));
      for (_i = 0, _len = rendererNames.length; _i < _len; _i++) {
        x = rendererNames[_i];
        radio = $("<input type='radio' name='renderers' id='renderers_" + (x.replace(/\s/g, "")) + "'>").css({
          "margin-left": "15px",
          "margin-right": "5px"
        }).val(x);
        if (x === "None") {
          radio.attr("checked", "checked");
        }
        form.append(radio).append($("<label class='checkbox inline' for='renderers_" + (x.replace(/\s/g, "")) + "'>").text(t(x)));
      }
      this.append($("<tr>").append(controls));
      $('input[name=renderers]', form).bind("change", function() {
        form.data('selected', $(this).val());
        return change_callback();
      });
      return form;
    },
    createColList: function(tblCols, hiddenAxes, axisValues, change_callback) {
      var c, colList, _i, _len;
      colList = $("<td colspan='2' id='unused' class='pvtAxisContainer pvtHorizList'>");
      for (_i = 0, _len = tblCols.length; _i < _len; _i++) {
        c = tblCols[_i];
        if (__indexOf.call(hiddenAxes, c) < 0) {
          (function(c) {
            var btns, colLabel, filterItem, k, keys, numKeys, v, valueList, _j, _len1, _ref;
            keys = (function() {
              var _ref, _results;
              _ref = axisValues[c];
              _results = [];
              for (k in _ref) {
                if (!__hasProp.call(_ref, k)) continue;
                v = _ref[k];
                _results.push(k);
              }
              return _results;
            })();
            numKeys = keys.length;
            colLabel = $("<nobr class='data-label'>").data('name', c).text(c);
            valueList = $("<div>").css({
              "z-index": 100,
              "width": "280px",
              "height": "350px",
              "overflow": "scroll",
              "border": "1px solid gray",
              "background": "white",
              "display": "none",
              "position": "absolute",
              "padding": "20px"
            });
            valueList.append($("<strong>").text(t("values for axis", numKeys, c)));
            if (numKeys > 20) {
              valueList.append($("<p>").text(t("(too many to list)")));
            } else {
              btns = $("<p>");
              btns.append($("<button>").text(t("Select All")).bind("click", function() {
                return valueList.find("input").attr("checked", true);
              }));
              btns.append($("<button>").text(t("Select None")).bind("click", function() {
                return valueList.find("input").attr("checked", false);
              }));
              valueList.append(btns);
              _ref = keys.sort();
              for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                k = _ref[_j];
                v = axisValues[c][k];
                filterItem = $("<label>");
                filterItem.append($("<input type='checkbox' class='pvtFilter'>").attr("checked", true).data("filter", [c, k]));
                filterItem.append($("<span>").text("" + k + " (" + v + ")"));
                valueList.append($("<p>").append(filterItem));
              }
            }
            colLabel.bind("dblclick", function(e) {
              valueList.css({
                left: e.pageX,
                top: e.pageY
              }).toggle();
              valueList.bind("click", function(e) {
                return e.stopPropagation();
              });
              return $(document).one("click", function() {
                change_callback();
                return valueList.toggle();
              });
            });
            return colList.append($("<li class='label label-info' id='axis_" + (c.replace(/\s/g, "")) + "'>").append(colLabel).append(valueList));
          })(c);
        }
      }
      this.append($("<tr>").append(colList));
      return colList;
    },
    createAggregatorMenu: function(aggregators, change_callback) {
      var aggregator, x;
      aggregator = $("<select id='aggregator'>").css("margin-bottom", "5px");
      for (x in aggregators) {
        if (!__hasProp.call(aggregators, x)) continue;
        aggregator.append($("<option>").val(x).text(t("aggregator." + x)));
      }
      aggregator.bind("change", change_callback);
      return aggregator;
    },
    initialUI: function() {
      var x, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      _ref = this.cols;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        x = _ref[_i];
        $("#cols").append($("#axis_" + (x.replace(/\s/g, ""))));
      }
      _ref1 = this.rows;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        x = _ref1[_j];
        $("#rows").append($("#axis_" + (x.replace(/\s/g, ""))));
      }
      _ref2 = this.vals;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        x = _ref2[_k];
        $("#vals").append($("#axis_" + (x.replace(/\s/g, ""))));
      }
      if (this.aggregatorName != null) {
        $("#aggregator").val(opts.aggregatorName);
      }
      if (this.rendererName != null) {
        return $("#renderers_" + (this.rendererName.replace(/\s/g, ""))).attr('checked', true).trigger('change');
      }
    }
  };

}).call(this);

;(function() {
  var $, pvt;

  $ = jQuery;

  pvt = window.PivotTable;

  pvt.plugins['fixedTableHeader'] = function(table, options) {
    console.log(table);
    return table.fixedTableHeaderPro(options);
  };

}).call(this);

;(function() {
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
          console.log(wrapper);
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

;(function() {
  var $, i18n, pvt;

  $ = jQuery;

  pvt = window.PivotTable;

  i18n = pvt.i18n;

  i18n["en"] = {
    "values for axis": function(args) {
      return "" + args[0] + " values for " + args[1];
    },
    "aggregator.count": "count",
    "aggregator.countUnique": "countUnique",
    "aggregator.listUnique": "listUnique",
    "aggregator.intSum": "intSum",
    "aggregator.sum": "Sum",
    "aggregator.average": "average",
    "aggregator.sumOverSum": "sumOverSum",
    "aggregator.ub80": "ub80",
    "aggregator.lb80": "lb80"
  };

  i18n["zh"] = i18n["zh-CN"] = {
    "Row Barchart": "行内柱状图",
    "Heatmap": "热点图",
    "Row Heatmap": "行热点图",
    "Col Heatmap": "列热点图",
    "null": "空值",
    "Totals": "合计",
    "None": "无",
    "Select None": "清除选择",
    "Select All": "选择全部",
    "Effects:": "特效:",
    "Fields:": "字段:",
    "(too many to list)": "(列表太长)",
    "values for axis": function(args) {
      return "共 " + args[0] + " 类 " + args[1];
    },
    "aggregator.count": "计数",
    "aggregator.countUnique": "非重复值计数",
    "aggregator.listUnique": "单行显示非重复值",
    "aggregator.intSum": "累加(取整)",
    "aggregator.sum": "累加",
    "aggregator.average": "平均值",
    "aggregator.sumOverSum": "累加并求比例",
    "aggregator.ub80": "累加并求比例2",
    "aggregator.lb80": "累加并求比例3"
  };

}).call(this);

;(function() {
  var $, pvt, renderers;

  $ = jQuery;

  pvt = window.PivotTable;

  renderers = pvt.renderers;

  $.extend(renderers, {
    "Row Barchart": function(pvtData) {
      return pvt.buildPivotTable(pvtData).barchart();
    },
    "Heatmap": function(pvtData) {
      return pvt.buildPivotTable(pvtData).heatmap();
    },
    "Row Heatmap": function(pvtData) {
      return pvt.buildPivotTable(pvtData).heatmap("rowheatmap");
    },
    "Col Heatmap": function(pvtData) {
      return pvt.buildPivotTable(pvtData).heatmap("colheatmap");
    }
  });

  /*
  Heatmap post-processing
  */


  $.fn.heatmap = function(scope) {
    var colorGen, heatmapper, i, j, numCols, numRows, _i, _j, _ref,
      _this = this;
    if (scope == null) {
      scope = "heatmap";
    }
    _ref = this.data("dimensions"), numRows = _ref[0], numCols = _ref[1];
    colorGen = function(color, min, max) {
      var hexGen;
      hexGen = (function() {
        switch (color) {
          case "red":
            return function(hex) {
              return "ff" + hex + hex;
            };
          case "green":
            return function(hex) {
              return "" + hex + "ff" + hex;
            };
          case "blue":
            return function(hex) {
              return "" + hex + hex + "ff";
            };
        }
      })();
      return function(x) {
        var hex, intensity;
        intensity = 255 - Math.round(255 * (x - min) / (max - min));
        hex = intensity.toString(16).split(".")[0];
        if (hex.length === 1) {
          hex = 0 + hex;
        }
        return hexGen(hex);
      };
    };
    heatmapper = function(scope, color) {
      var colorFor, forEachCell, values;
      forEachCell = function(f) {
        return _this.find(scope).each(function() {
          var x;
          x = $(this).data("value");
          if ((x != null) && isFinite(x)) {
            return f(x, $(this));
          }
        });
      };
      values = [];
      forEachCell(function(x) {
        return values.push(x);
      });
      colorFor = colorGen(color, Math.min.apply(Math, values), Math.max.apply(Math, values));
      return forEachCell(function(x, elem) {
        return elem.css("background-color", "#" + colorFor(x));
      });
    };
    switch (scope) {
      case "heatmap":
        heatmapper(".pvtVal", "red");
        break;
      case "rowheatmap":
        for (i = _i = 0; 0 <= numRows ? _i < numRows : _i > numRows; i = 0 <= numRows ? ++_i : --_i) {
          heatmapper(".pvtVal.row" + i, "red");
        }
        break;
      case "colheatmap":
        for (j = _j = 0; 0 <= numCols ? _j < numCols : _j > numCols; j = 0 <= numCols ? ++_j : --_j) {
          heatmapper(".pvtVal.col" + j, "red");
        }
    }
    heatmapper(".pvtTotal.rowTotal", "red");
    heatmapper(".pvtTotal.colTotal", "red");
    return this;
  };

  /*
  Barchart post-processing
  */


  $.fn.barchart = function() {
    var barcharter, i, numCols, numRows, _i, _ref,
      _this = this;
    _ref = this.data("dimensions"), numRows = _ref[0], numCols = _ref[1];
    barcharter = function(scope) {
      var forEachCell, max, scaler, values;
      forEachCell = function(f) {
        return _this.find(scope).each(function() {
          var x;
          x = $(this).data("value");
          if ((x != null) && isFinite(x)) {
            return f(x, $(this));
          }
        });
      };
      values = [];
      forEachCell(function(x) {
        return values.push(x);
      });
      max = Math.max.apply(Math, values);
      scaler = function(x) {
        return 100 * x / (1.4 * max);
      };
      return forEachCell(function(x, elem) {
        var text, wrapper;
        text = elem.text();
        wrapper = $("<div>").css({
          "position": "relative",
          "height": "55px"
        });
        wrapper.append($("<div>").css({
          "position": "absolute",
          "bottom": 0,
          "left": 0,
          "right": 0,
          "height": scaler(x) + "%",
          "background-color": "gray"
        }));
        wrapper.append($("<div>").text(text).css({
          "position": "relative",
          "padding-left": "5px",
          "padding-right": "5px"
        }));
        return elem.css({
          "padding": 0,
          "padding-top": "5px",
          "text-align": "center"
        }).html(wrapper);
      });
    };
    for (i = _i = 0; 0 <= numRows ? _i < numRows : _i > numRows; i = 0 <= numRows ? ++_i : --_i) {
      barcharter(".pvtVal.row" + i);
    }
    barcharter(".pvtTotal.colTotal");
    return this;
  };

}).call(this);
