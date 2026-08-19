/* Sitewide ledger tables: filter, sort, column resize, wide sheet.
   External file so CSP script-src 'self' holds. Enhances every <table>
   with a thead unless marked data-table-static. */
(function () {
  var MONTH = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };

  function cellText(el) {
    return (el && el.textContent ? el.textContent : '').replace(/\s+/g, ' ').trim();
  }

  function sortKey(text) {
    var raw = cellText({ textContent: text });
    if (!raw || raw === '—' || raw === '–' || raw === '-') {
      return { band: 2, n: 0, s: '' };
    }
    var d = raw.match(/^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i);
    if (d) {
      var mo = MONTH[d[2].slice(0, 3).toLowerCase()];
      return { band: 0, n: mo * 32 + parseInt(d[1], 10), s: raw.toLowerCase() };
    }
    var m = raw.match(/([$€£])?\s*(-?[\d,.]+)\s*([KMBT])?\b/i);
    if (m) {
      var n = parseFloat(m[2].replace(/,/g, ''));
      if (!isNaN(n)) {
        var mul = { K: 1e3, M: 1e6, B: 1e9, T: 1e12 };
        var u = m[3] ? m[3].toUpperCase() : '';
        if (u && mul[u]) n *= mul[u];
        return { band: 0, n: n, s: raw.toLowerCase() };
      }
    }
    return { band: 1, n: 0, s: raw.toLowerCase() };
  }

  function cmpKeys(a, b) {
    if (a.band !== b.band) return a.band - b.band;
    if (a.n !== b.n) return a.n < b.n ? -1 : 1;
    if (a.s < b.s) return -1;
    if (a.s > b.s) return 1;
    return 0;
  }

  function enhance(table) {
    if (!table || table.closest('.table-desk')) return;
    if (table.getAttribute('data-table-static') !== null) return;
    var thead = table.tHead;
    var tbody = table.tBodies && table.tBodies[0];
    if (!thead || !tbody || !thead.rows.length || !tbody.rows.length) return;
    var headerRow = thead.rows[0];
    var colCount = headerRow.cells.length;
    if (colCount < 2) return;

    var wrap = table.closest('.table-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    }
    wrap.classList.add('table-desk');

    var bar = document.createElement('div');
    bar.className = 'table-desk-bar';

    var filter = document.createElement('input');
    filter.type = 'search';
    filter.className = 'table-desk-filter';
    filter.setAttribute('aria-label', 'Filter table rows');
    filter.placeholder = 'Filter rows';
    filter.autocomplete = 'off';

    var count = document.createElement('span');
    count.className = 'table-desk-count';
    count.setAttribute('aria-live', 'polite');

    var reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'table-desk-btn';
    reset.textContent = 'Reset';

    var wide = document.createElement('button');
    wide.type = 'button';
    wide.className = 'table-desk-btn';
    wide.setAttribute('aria-pressed', 'false');
    wide.textContent = 'Wide';

    bar.appendChild(filter);
    bar.appendChild(count);
    bar.appendChild(reset);
    bar.appendChild(wide);
    wrap.insertBefore(bar, wrap.firstChild);

    var scroller = document.createElement('div');
    scroller.className = 'table-desk-scroll';
    wrap.insertBefore(scroller, table);
    scroller.appendChild(table);

    var colgroup = document.createElement('colgroup');
    for (var c = 0; c < colCount; c++) {
      colgroup.appendChild(document.createElement('col'));
    }
    table.insertBefore(colgroup, table.firstChild);

    var state = { q: '', col: -1, dir: 0 };
    var orig = Array.prototype.map.call(tbody.rows, function (row, i) {
      return { row: row, i: i };
    });

    function apply() {
      var q = state.q;
      var shown = 0;
      orig.forEach(function (item) {
        var hay = cellText(item.row).toLowerCase();
        var match = !q || hay.indexOf(q) !== -1;
        if (match) {
          item.row.removeAttribute('hidden');
          shown += 1;
        } else {
          item.row.setAttribute('hidden', '');
        }
      });
      var sorted = orig.slice();
      if (state.dir !== 0 && state.col >= 0) {
        sorted.sort(function (a, b) {
          var ka = sortKey(cellText(a.row.cells[state.col]));
          var kb = sortKey(cellText(b.row.cells[state.col]));
          var d = cmpKeys(ka, kb);
          if (d === 0) d = a.i - b.i;
          return state.dir === 1 ? d : -d;
        });
      } else {
        sorted.sort(function (a, b) {
          return a.i - b.i;
        });
      }
      sorted.forEach(function (item) {
        tbody.appendChild(item.row);
      });
      count.textContent = shown + ' / ' + orig.length;
    }

    Array.prototype.forEach.call(headerRow.cells, function (th, idx) {
      th.setAttribute('scope', 'col');
      var label = document.createElement('button');
      label.type = 'button';
      label.className = 'table-desk-sort';
      while (th.firstChild) label.appendChild(th.firstChild);
      th.appendChild(label);
      label.addEventListener('click', function () {
        if (state.col === idx) {
          state.dir = state.dir === 1 ? -1 : state.dir === -1 ? 0 : 1;
          if (state.dir === 0) state.col = -1;
        } else {
          state.col = idx;
          state.dir = 1;
        }
        Array.prototype.forEach.call(headerRow.cells, function (cell, i) {
          if (i === state.col && state.dir === 1) cell.setAttribute('aria-sort', 'ascending');
          else if (i === state.col && state.dir === -1)
            cell.setAttribute('aria-sort', 'descending');
          else cell.removeAttribute('aria-sort');
        });
        apply();
      });

      var handle = document.createElement('span');
      handle.className = 'table-desk-resize';
      handle.setAttribute('aria-hidden', 'true');
      th.appendChild(handle);
      handle.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var startX = e.clientX;
        var startW = th.getBoundingClientRect().width;
        var col = colgroup.children[idx];
        table.style.tableLayout = 'fixed';
        function move(ev) {
          var w = Math.max(56, Math.round(startW + ev.clientX - startX));
          th.style.width = w + 'px';
          if (col) col.style.width = w + 'px';
        }
        function up() {
          document.removeEventListener('pointermove', move);
          document.removeEventListener('pointerup', up);
        }
        document.addEventListener('pointermove', move);
        document.addEventListener('pointerup', up);
      });
    });

    filter.addEventListener('input', function () {
      state.q = filter.value.replace(/\s+/g, ' ').trim().toLowerCase();
      apply();
    });

    reset.addEventListener('click', function () {
      state.q = '';
      state.col = -1;
      state.dir = 0;
      filter.value = '';
      Array.prototype.forEach.call(headerRow.cells, function (cell) {
        cell.removeAttribute('aria-sort');
        cell.style.width = '';
      });
      Array.prototype.forEach.call(colgroup.children, function (col) {
        col.style.width = '';
      });
      table.style.tableLayout = '';
      wrap.classList.remove('is-wide');
      wide.setAttribute('aria-pressed', 'false');
      wide.textContent = 'Wide';
      apply();
    });

    wide.addEventListener('click', function () {
      var on = wrap.classList.toggle('is-wide');
      wide.setAttribute('aria-pressed', on ? 'true' : 'false');
      wide.textContent = on ? 'Sheet' : 'Wide';
    });

    apply();
  }

  function init() {
    var nodes = document.querySelectorAll(
      'article table, .post-body table, .dispatch-prose table, .legal table, main table',
    );
    var seen = [];
    Array.prototype.forEach.call(nodes, function (table) {
      if (seen.indexOf(table) !== -1) return;
      seen.push(table);
      enhance(table);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
