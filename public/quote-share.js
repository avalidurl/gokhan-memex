/**
 * Highlight sharing on journal posts.
 *
 * Select text in the article: a "Share quote" chip appears. It builds a URL
 * with ?q= (for the quote card, which social crawlers read from rewritten
 * meta tags) and a #:~:text= fragment (for browsers that support text
 * fragments). The chip copies the link and uses the Web Share API when present.
 */
(function () {
  'use strict'

  var MAX = 320
  var bar = null
  var live = null

  function article() {
    return document.querySelector('[data-quote-share]')
  }

  function sanitize(s) {
    s = String(s || '')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (s.length > MAX) s = s.slice(0, MAX - 1).replace(/\s+\S*$/, '') + '…'
    return s
  }

  function fragment(s) {
    // Text-fragment start,end from the first and last few words.
    var words = s.split(' ').filter(Boolean)
    function enc(t) {
      return encodeURIComponent(t).replace(/-/g, '%2D')
    }
    if (words.length <= 8) return enc(s)
    return enc(words.slice(0, 5).join(' ')) + ',' + enc(words.slice(-5).join(' '))
  }

  function shareUrl(quote) {
    var el = article()
    var base = (el && el.getAttribute('data-quote-url')) || (location.origin + location.pathname)
    var url = new URL(base, location.origin)
    url.searchParams.set('q', quote)
    url.hash = ':~:text=' + fragment(quote)
    return url.toString()
  }

  function ensureBar() {
    if (bar) return bar
    bar = document.createElement('div')
    bar.id = 'quote-share-bar'
    bar.setAttribute('role', 'toolbar')
    bar.setAttribute('aria-label', 'Share selected quote')
    bar.hidden = true
    bar.innerHTML =
      '<button type="button" class="qs-share">Share quote</button>' +
      '<span class="qs-status" hidden></span>'
    document.body.appendChild(bar)
    bar.querySelector('.qs-share').addEventListener('click', function (e) {
      e.preventDefault()
      e.stopPropagation()
      var q = bar.dataset.quote
      if (!q) return
      var url = shareUrl(q)
      var title = (article() && article().getAttribute('data-quote-title')) || document.title
      function done(msg) {
        var st = bar.querySelector('.qs-status')
        st.hidden = false
        st.textContent = msg
        setTimeout(function () {
          st.hidden = true
        }, 2000)
      }
      var shareData = { title: '“' + q + '” — ' + title, text: q, url: url }
      if (navigator.share) {
        navigator.share(shareData).then(function () { done('Shared') }).catch(function () {
          copy(url).then(function () { done('Link copied') })
        })
      } else {
        copy(url).then(function () { done('Link copied') })
      }
    })
    return bar
  }

  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text)
    }
    return new Promise(function (resolve) {
      var ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy') } catch (e) {}
      document.body.removeChild(ta)
      resolve()
    })
  }

  function hide() {
    if (bar) bar.hidden = true
  }

  function show(range, quote) {
    var b = ensureBar()
    b.dataset.quote = quote
    b.querySelector('.qs-status').hidden = true
    var rect = range.getBoundingClientRect()
    var top = rect.top + window.scrollY - 48
    if (top < window.scrollY + 8) top = rect.bottom + window.scrollY + 8
    var left = rect.left + window.scrollX + rect.width / 2
    b.style.top = Math.max(8, top) + 'px'
    b.style.left = Math.max(8, left) + 'px'
    b.hidden = false
  }

  function selectionInArticle() {
    var a = article()
    if (!a) return null
    var sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.rangeCount) return null
    var range = sel.getRangeAt(0)
    if (!a.contains(range.commonAncestorContainer)) return null
    var quote = sanitize(sel.toString())
    if (quote.length < 8) return null
    return { range: range, quote: quote }
  }

  function onSelect() {
    var hit = selectionInArticle()
    if (!hit) {
      hide()
      return
    }
    show(hit.range, hit.quote)
  }

  function highlightLanding() {
    var params = new URLSearchParams(location.search)
    var q = sanitize(params.get('q') || '')
    if (!q) return
    var a = article()
    if (!a) return
    // Prefer the text-fragment (browser-native). Also wrap a first occurrence
    // so the quote is visible even where fragments are unsupported.
    var text = a.textContent || ''
    var idx = text.replace(/\s+/g, ' ').indexOf(q)
    // Walk text nodes to find a raw match.
    var walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT, null)
    var node
    var needle = q.slice(0, Math.min(q.length, 80))
    while ((node = walker.nextNode())) {
      var i = node.nodeValue.indexOf(needle)
      if (i === -1) continue
      try {
        var range = document.createRange()
        range.setStart(node, i)
        range.setEnd(node, Math.min(node.nodeValue.length, i + needle.length))
        var mark = document.createElement('mark')
        mark.className = 'qs-mark'
        range.surroundContents(mark)
        mark.scrollIntoView({ block: 'center', behavior: 'smooth' })
      } catch (e) {}
      break
    }
  }

  document.addEventListener('selectionchange', function () {
    clearTimeout(live)
    live = setTimeout(onSelect, 80)
  })
  document.addEventListener('mousedown', function (e) {
    if (bar && !bar.hidden && !bar.contains(e.target)) hide()
  })
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hide()
  })
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', highlightLanding)
  } else {
    highlightLanding()
  }
})()
