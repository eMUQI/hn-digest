// Builds the right-hand table of contents from the enhanced digest structure.
(function () {
  var toc = document.getElementById('toc');
  var prose = document.querySelector('.prose');
  if (!toc || !prose) return;

  var links = toc.querySelector('.toc-links');
  if (!links) return;

  function labelForHeading(h) {
    var clone = h.cloneNode(true);
    Array.prototype.forEach.call(clone.querySelectorAll('.category-count'), function (n) { n.remove(); });
    return clone.textContent.trim();
  }

  function addLink(target, text, sub) {
    if (!target || !target.id) return null;
    var a = document.createElement('a');
    a.href = '#' + target.id;
    a.textContent = text;
    if (sub) a.className = 'toc-sub';
    links.appendChild(a);
    return a;
  }

  var observed = [];
  var list = document.getElementById('list');
  if (list) {
    addLink(list, '榜单 30 条', false);
    observed.push(list);
  }

  var headings = prose.querySelectorAll('h2, h3');
  Array.prototype.forEach.call(headings, function (h, i) {
    if (!h.id) h.id = 's-' + i;
    addLink(h, labelForHeading(h), h.tagName === 'H3');
    observed.push(h);
  });

  if (!links.children.length) return;
  toc.hidden = false;

  var current = null;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      if (current) current.classList.remove('active');
      current = links.querySelector('a[href="#' + entry.target.id + '"]');
      if (current) current.classList.add('active');
    });
  }, { rootMargin: '-80px 0px -70% 0px' });

  observed.forEach(function (node) { observer.observe(node); });
})();