/* Shared subpage behaviour: nav shadow, mobile menu, reveals, sub-nav active state. */
(function () {
  var nav = document.getElementById('main-nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  var burger = document.getElementById('nav-hamburger');
  var menu = document.getElementById('mobile-menu');
  if (burger && menu) {
    burger.addEventListener('click', function () { menu.classList.toggle('open'); });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') menu.classList.remove('open');
    });
  }

  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  var subLinks = document.querySelectorAll('.subnav a[href^="#"]');
  if (subLinks.length) {
    var targets = [];
    subLinks.forEach(function (a) {
      var t = document.querySelector(a.getAttribute('href'));
      if (t) targets.push({ link: a, el: t });
    });
    var sync = function () {
      var y = window.scrollY + 200, current = targets[0];
      targets.forEach(function (t) { if (t.el.offsetTop <= y) current = t; });
      subLinks.forEach(function (a) { a.classList.remove('active'); });
      if (current) current.link.classList.add('active');
    };
    sync();
    window.addEventListener('scroll', sync, { passive: true });
  }

  /* Shared forms: validate, then hand off to the visitor's email app. */
  document.querySelectorAll('form.atf-form').forEach(function (form) {
    function clear() {
      form.querySelectorAll('.field-error').forEach(function (e) { e.remove(); });
      form.querySelectorAll('.invalid').forEach(function (e) { e.classList.remove('invalid'); });
    }
    function flag(el, msg) {
      var wrap = el.closest('.field') || el.closest('.consent') || el.parentElement;
      wrap.classList.add('invalid');
      var s = document.createElement('span'); s.className = 'field-error'; s.textContent = msg;
      wrap.appendChild(s);
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault(); clear();
      var first = null;
      form.querySelectorAll('[required]').forEach(function (el) {
        var bad = el.type === 'checkbox' ? !el.checked : !el.value.trim();
        var msg = el.type === 'checkbox' ? 'Please tick this box to continue.' : 'Please fill this in.';
        if (!bad && el.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value.trim())) { bad = true; msg = 'That email doesn\u2019t look right \u2014 check for typos.'; }
        if (bad) { flag(el, msg); first = first || el; }
      });
      form.querySelectorAll('[data-group-required]').forEach(function (fs) {
        if (!fs.querySelector('input:checked')) { flag(fs.querySelector('.check-chips'), 'Choose at least one.'); first = first || fs.querySelector('input'); }
      });
      if (first) { first.focus(); return; }
      var lines = [], seen = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || seen[el.name] || el.type === 'submit') return;
        var val;
        if (el.type === 'checkbox') {
          seen[el.name] = 1;
          val = Array.prototype.map.call(form.querySelectorAll('input[name="' + el.name + '"]:checked'), function (c) { return c.value; }).join(', ');
        } else val = el.value.trim();
        if (val) lines.push(el.name + ': ' + val);
      });
      var to = form.getAttribute('data-mailto'), subj = form.getAttribute('data-subject') || 'Website enquiry';
      window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(lines.join('\n\n'));
      var done = document.createElement('div'); done.className = 'form-done'; done.setAttribute('role', 'status');
      done.innerHTML = '<h3>Ready to send.</h3><p>Your email app should have opened with your details filled in \u2014 press send there. If nothing opened, write to <a href="mailto:' + to + '">' + to + '</a>.</p><button type="button" class="btn-outline">Edit my answers</button>';
      form.style.display = 'none'; form.parentNode.insertBefore(done, form.nextSibling);
      done.querySelector('button').addEventListener('click', function () { done.remove(); form.style.display = ''; });
    });
  });
})();
