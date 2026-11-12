/* Projects table filter — single-select per group (category, status).
   External file so it satisfies the strict CSP script-src 'self'. */
(function () {
  function init() {
    var rows = Array.prototype.slice.call(document.querySelectorAll('.proj-row'));
    if (!rows.length) return;

    var state = { category: 'all', status: 'all' };
    var countEl = document.getElementById('proj-count');
    var emptyEl = document.getElementById('proj-empty');
    var groups = document.querySelectorAll('.chips');

    function apply() {
      var shown = 0;
      rows.forEach(function (row) {
        var okCat =
          state.category === 'all' || row.getAttribute('data-category') === state.category;
        var okStatus = state.status === 'all' || row.getAttribute('data-status') === state.status;
        var show = okCat && okStatus;
        if (show) {
          row.removeAttribute('hidden');
          shown += 1;
        } else {
          row.setAttribute('hidden', '');
        }
      });
      if (countEl) countEl.textContent = String(shown);
      if (emptyEl) {
        if (shown === 0) emptyEl.removeAttribute('hidden');
        else emptyEl.setAttribute('hidden', '');
      }
    }

    Array.prototype.forEach.call(groups, function (group) {
      var dimension = group.getAttribute('data-filter'); // 'category' | 'status'
      if (!dimension) return;
      group.addEventListener('click', function (event) {
        var target = event.target;
        var btn = target && target.closest ? target.closest('.chip') : null;
        if (!btn || !group.contains(btn)) return;
        state[dimension] = btn.getAttribute('data-value') || 'all';
        Array.prototype.forEach.call(group.querySelectorAll('.chip'), function (chip) {
          var active = chip === btn;
          chip.classList.toggle('is-active', active);
          chip.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        apply();
      });
    });

    apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
