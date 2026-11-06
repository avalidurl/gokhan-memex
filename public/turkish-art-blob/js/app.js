(function () {
  var b = document.body;

  function mode(m) {
    b.classList.remove('art', 'tech');
    b.classList.add(m);
    document.querySelectorAll('[data-mode]').forEach(function (x) {
      var active = x.dataset.mode === m;
      x.classList.toggle('on', active);
      x.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    try { localStorage.tab_mode = m; } catch (e) {}
  }

  document.querySelectorAll('[data-mode]').forEach(function (x) {
    x.addEventListener('click', function () { mode(x.dataset.mode); });
  });

  var tr = document.getElementById('trbtn');
  if (tr) {
    tr.addEventListener('click', function () {
      var on = b.classList.toggle('show-tr');
      tr.classList.toggle('on', on);
      tr.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  var mic = document.getElementById('mic');
  if (mic) {
    mic.addEventListener('click', function () {
      if (!window.blobMic) {
        mic.textContent = '3D shader unavailable in this browser';
        return;
      }
      window.blobMic().then(function (ok) {
        mic.textContent = ok
          ? 'Listening — speak to move it'
          : 'Microphone blocked (breathing animation stays active)';
      });
    });
  }

  document.querySelectorAll('[data-mood-color]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('[data-mood-color]').forEach(function (p) {
        p.classList.remove('on');
      });
      btn.classList.add('on');
      var col = btn.getAttribute('data-mood-color');
      var sh = parseFloat(btn.getAttribute('data-mood-shape') || '1');
      if (window.blobMood) {
        window.blobMood(col, sh);
      }
      var orb = document.querySelector('.blob-orb');
      if (orb && col) {
        orb.style.background = 'radial-gradient(circle at 36% 32%, #ffe9e6 0%, ' + col + ' 55%, #8f2d3e 100%)';
      }
    });
  });

  var blobEl = document.getElementById('blob');
  if (blobEl && blobEl.querySelector('canvas')) {
    blobEl.classList.add('ready');
  } else if (blobEl) {
    setTimeout(function () {
      if (blobEl.querySelector('canvas')) blobEl.classList.add('ready');
    }, 150);
  }

  var m = 'art';
  try { m = localStorage.tab_mode || 'art'; } catch (e) {}
  mode(m);
})();
