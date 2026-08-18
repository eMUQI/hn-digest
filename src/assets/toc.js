// Builds the right-hand table of contents from the rendered digest headings.
(function () {
  var toc = document.getElementById("toc");
  var prose = document.querySelector(".prose");
  if (!toc || !prose) return;

  var links = toc.querySelector(".toc-links");
  var slug = function (text, i) {
    return "s-" + i + "-" + text.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\u4e00-\u9fa5-]/g, "").slice(0, 40);
  };

  var headings = prose.querySelectorAll("h2, h3");
  if (!headings.length) return;

  Array.prototype.forEach.call(headings, function (h, i) {
    if (!h.id) h.id = slug(h.textContent, i);
    var a = document.createElement("a");
    a.href = "#" + h.id;
    a.textContent = h.textContent;
    a.className = h.tagName === "H3" ? "toc-sub" : "";
    links.appendChild(a);
  });

  toc.hidden = false;

  var current = null;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      if (current) current.classList.remove("active");
      current = links.querySelector('a[href="#' + entry.target.id + '"]');
      if (current) current.classList.add("active");
    });
  }, { rootMargin: "-80px 0px -70% 0px" });

  Array.prototype.forEach.call(headings, function (h) { observer.observe(h); });
})();
