(function () {
  var prose = document.querySelector('.prose');
  if (!prose) return;

  function normalizeText(value) {
    return (value || '').replace(/\s+/g, ' ').trim();
  }

  function hostname(href) {
    try { return new URL(href, window.location.href).hostname.replace(/^www\./, ''); }
    catch (e) { return href; }
  }

  function directLists(selector) {
    return Array.prototype.filter.call(prose.querySelectorAll(selector), function (node) {
      return node.parentElement === prose;
    });
  }

  var orderedLists = directLists('ol');
  var mainList = prose.querySelector('ol.digest-list');
  if (!mainList) {
    mainList = orderedLists.find(function (list) { return list.children.length >= 20; }) || orderedLists[1] || orderedLists[0];
  }
  if (!mainList) return;

  mainList.classList.add('digest-list');
  mainList.id = 'list';

  var verificationList = orderedLists.find(function (list) { return list !== mainList; });
  if (verificationList && verificationList.children.length <= 3) verificationList.classList.add('digest-validation-list');

  var preListParagraphs = [];
  var preNode = prose.firstElementChild;
  while (preNode && preNode !== mainList) {
    if (preNode.tagName === 'P') preListParagraphs.push(preNode);
    preNode = preNode.nextElementSibling;
  }
  if (preListParagraphs.length) {
    preListParagraphs[0].classList.add('digest-note');
    if (preListParagraphs.length > 1) {
      preListParagraphs[0].innerHTML += ' ' + preListParagraphs[1].innerHTML;
      preListParagraphs[1].remove();
    }
  }

  var itemMap = {};
  Array.prototype.forEach.call(mainList.children, function (li, index) {
    if (li.tagName !== 'LI') return;
    var number = String(index + 1).padStart(2, '0');
    li.classList.add('digest-item');
    li.id = 'item-' + number;

    var title = li.querySelector('strong');
    if (title) title.classList.add('digest-item-title');

    var anchors = Array.prototype.slice.call(li.querySelectorAll('a[href]'));
    var hn = anchors.find(function (a) { return /news\.ycombinator\.com\/item\?id=/.test(a.href); });
    var original = anchors.find(function (a) { return a !== hn; }) || hn;

    if (title && original && !title.querySelector('a')) {
      var titleLink = document.createElement('a');
      titleLink.href = original.href;
      titleLink.className = 'digest-title-link';
      while (title.firstChild) titleLink.appendChild(title.firstChild);
      title.appendChild(titleLink);
    }

    if (original) {
      original.classList.add('digest-source');
      original.textContent = hostname(original.href);
    }
    if (hn) {
      hn.classList.add('digest-hn');
      hn.textContent = 'HN 讨论';
    }
    if (original && hn) {
      var between = original.nextSibling;
      while (between && between !== hn) {
        if (between.nodeType === Node.TEXT_NODE && /｜/.test(between.nodeValue || '')) between.nodeValue = ' · ';
        between = between.nextSibling;
      }
    }

    itemMap[String(index + 1)] = {
      number: number,
      id: li.id,
      original: original ? original.href : '',
      hn: hn ? hn.href : '',
      host: original ? hostname(original.href) : '',
      title: title ? normalizeText(title.textContent) : ''
    };
  });

  var categoryHeading = Array.prototype.find.call(prose.querySelectorAll('h2'), function (h) {
    return normalizeText(h.textContent) === '重点分类';
  });
  if (!categoryHeading) return;
  categoryHeading.id = 'cats';

  function slug(text, i) {
    var value = normalizeText(text).toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '').slice(0, 48);
    return 'cat-' + (value || i);
  }

  var categoryHeadings = [];
  var cursor = categoryHeading.nextElementSibling;
  while (cursor) {
    if (cursor.tagName === 'H2') break;
    if (cursor.tagName === 'H3') categoryHeadings.push(cursor);
    cursor = cursor.nextElementSibling;
  }

  categoryHeadings.forEach(function (h, index) {
    if (!h.id) h.id = slug(h.textContent, index);
    h.classList.add('category-heading');
  });

  var categoryNav = document.createElement('nav');
  categoryNav.className = 'digest-category-nav';
  categoryNav.setAttribute('aria-label', '本期分类');
  var navLabel = document.createElement('span');
  navLabel.textContent = '本期分类';
  categoryNav.appendChild(navLabel);
  categoryHeadings.forEach(function (h) {
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = normalizeText(h.textContent);
    categoryNav.appendChild(a);
  });
  mainList.parentNode.insertBefore(categoryNav, mainList);

  function cleanupCitation(body, anchor) {
    if (!anchor) return;
    var prev = anchor.previousSibling;
    var next = anchor.nextSibling;
    if (prev && prev.nodeType === Node.TEXT_NODE && /\($/.test(prev.nodeValue || '')) {
      prev.nodeValue = prev.nodeValue.replace(/\($/, '');
      if (!prev.nodeValue) prev.remove();
    }
    if (next && next.nodeType === Node.TEXT_NODE && /^\)/.test(next.nodeValue || '')) {
      next.nodeValue = next.nodeValue.replace(/^\)/, '');
      if (!next.nodeValue) next.remove();
    }
    anchor.remove();
  }

  function enhanceCategoryItem(li, explicitNumber) {
    if (!li || li.dataset.enhancedCategory === 'true') return null;
    var firstStrong = li.querySelector('strong');
    var text = firstStrong ? normalizeText(firstStrong.textContent) : normalizeText(li.textContent);
    var match = explicitNumber ? [null, String(explicitNumber)] : text.match(/^(\d{1,2})\s*[｜|]/);
    if (!match) return null;
    var ref = parseInt(match[1], 10);
    var item = itemMap[String(ref)];
    if (!item) return null;

    li.dataset.enhancedCategory = 'true';
    li.classList.add('category-item');

    var body = document.createElement('div');
    body.className = 'category-body';
    while (li.firstChild) body.appendChild(li.firstChild);

    var oldSource = body.querySelector('a[href]');
    cleanupCitation(body, oldSource);

    if (firstStrong) {
      var clean = normalizeText(firstStrong.textContent).replace(/^\d{1,2}\s*[｜|]\s*/, '');
      if (explicitNumber) clean = clean.replace(/^\d{1,2}\s*条\s*/, '');
      var titleLink = document.createElement('a');
      titleLink.href = item.original || ('#' + item.id);
      titleLink.className = 'category-title';
      titleLink.textContent = clean;
      firstStrong.replaceWith(titleLink);
    }

    var refLink = document.createElement('a');
    refLink.className = 'category-ref';
    refLink.href = '#' + item.id;
    refLink.title = '跳到榜单该条';
    refLink.textContent = item.number;

    var meta = document.createElement('div');
    meta.className = 'category-meta';
    if (item.original) {
      var source = document.createElement('a');
      source.href = item.original;
      source.textContent = item.host;
      meta.appendChild(source);
    }
    if (item.original && item.hn) {
      var dot = document.createElement('span'); dot.textContent = '·'; meta.appendChild(dot);
    }
    if (item.hn) {
      var hn = document.createElement('a'); hn.href = item.hn; hn.textContent = 'HN 讨论'; meta.appendChild(hn);
    }
    body.appendChild(meta);
    li.appendChild(refLink);
    li.appendChild(body);
    return li;
  }

  categoryHeadings.forEach(function (heading) {
    var nodes = [];
    var node = heading.nextElementSibling;
    while (node && node.tagName !== 'H3' && node.tagName !== 'H2') {
      nodes.push(node);
      node = node.nextElementSibling;
    }

    var list = nodes.find(function (n) { return n.tagName === 'UL'; });
    if (list) list.classList.add('category-list');
    if (list) Array.prototype.forEach.call(list.children, function (li) { enhanceCategoryItem(li); });

    nodes.filter(function (n) { return n.tagName === 'P'; }).forEach(function (p) {
      var m = normalizeText(p.textContent).match(/第\s*(\d{1,2})\s*条/);
      if (!m) return;
      var syntheticList = list;
      if (!syntheticList) {
        syntheticList = document.createElement('ul');
        syntheticList.className = 'category-list';
        p.parentNode.insertBefore(syntheticList, p);
        list = syntheticList;
      }
      var li = document.createElement('li');
      while (p.firstChild) li.appendChild(p.firstChild);
      syntheticList.appendChild(li);
      p.remove();
      enhanceCategoryItem(li, parseInt(m[1], 10));
    });

    var count = list ? list.querySelectorAll('.category-item').length : 0;
    var countSpan = document.createElement('span');
    countSpan.className = 'category-count';
    var sectionText = nodes.map(function (n) { return normalizeText(n.textContent); }).join(' ');
    countSpan.textContent = /没有直接涉及/.test(sectionText) ? '0 条直接相关' : (count ? count + ' 条' : '0 条');
    heading.appendChild(countSpan);
  });
})();