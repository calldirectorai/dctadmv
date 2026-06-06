/* =============================================================
   DCTA DMV — shared interactions
   ============================================================= */
(function(){
  'use strict';

  /* ---- sticky header shadow ---- */
  var head = document.querySelector('.site-head');
  if(head){
    var onScroll = function(){ head.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll(); window.addEventListener('scroll', onScroll, {passive:true});
  }

  /* ---- mobile drawer ---- */
  var burger = document.querySelector('.burger');
  var drawer = document.querySelector('.mobile-nav');
  var scrim  = document.querySelector('.scrim');
  function setNav(open){
    if(!drawer) return;
    drawer.classList.toggle('open', open);
    scrim && scrim.classList.toggle('open', open);
    burger && burger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger && burger.addEventListener('click', function(){ setNav(!drawer.classList.contains('open')); });
  scrim && scrim.addEventListener('click', function(){ setNav(false); });
  document.querySelectorAll('.mobile-nav a, .mn-close').forEach(function(el){
    el.addEventListener('click', function(){ setNav(false); });
  });

  /* ---- scroll reveal ---- */
  var revs = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && revs.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, {threshold:.12, rootMargin:'0px 0px -8% 0px'});
    revs.forEach(function(el){ io.observe(el); });
  } else { revs.forEach(function(el){ el.classList.add('in'); }); }

  /* ---- animated counters ---- */
  var counted = false;
  function runCounters(){
    if(counted) return; counted = true;
    document.querySelectorAll('[data-count]').forEach(function(el){
      var target = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = 1400, start = null;
      function tick(ts){
        if(!start) start = ts;
        var p = Math.min((ts - start)/dur, 1);
        var ease = 1 - Math.pow(1 - p, 3);
        var val = target * ease;
        el.textContent = (target % 1 === 0 ? Math.round(val) : val.toFixed(1)) + suffix;
        if(p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  var statBand = document.querySelector('[data-counters]');
  if(statBand && 'IntersectionObserver' in window){
    var cio = new IntersectionObserver(function(en){
      en.forEach(function(e){ if(e.isIntersecting){ runCounters(); cio.disconnect(); }});
    }, {threshold:.4});
    cio.observe(statBand);
  } else { runCounters(); }

  /* ---- accordions (curriculum + FAQ) ---- */
  document.querySelectorAll('.acc-head').forEach(function(head){
    head.addEventListener('click', function(){
      var item = head.closest('.acc-item');
      var body = item.querySelector('.acc-body');
      var open = item.classList.contains('open');
      // optional single-open behaviour within a group
      var group = item.closest('[data-accordion-single]');
      if(group && !open){
        group.querySelectorAll('.acc-item.open').forEach(function(o){
          o.classList.remove('open'); o.querySelector('.acc-body').style.maxHeight = null;
        });
      }
      item.classList.toggle('open', !open);
      body.style.maxHeight = open ? null : body.scrollHeight + 'px';
    });
  });

  /* ---- form handling (stub → wire PMG webhook) ---- */
  document.querySelectorAll('form[data-pmg-form]').forEach(function(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var endpoint = form.getAttribute('action') || '';
      var data = Object.fromEntries(new FormData(form).entries());
      var done = function(){
        var card = form.closest('.form-card') || form.parentElement;
        var ok = card.querySelector('.form-success');
        form.style.display = 'none';
        if(ok) ok.classList.add('show');
      };
      // If a real PMG webhook URL is wired, POST to it; otherwise just show success (reference mode)
      if(endpoint && endpoint.indexOf('YOUR_PMG_WEBHOOK_URL') === -1 && /^https?:\/\//.test(endpoint)){
        fetch(endpoint, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify(data)
        }).then(done).catch(done);
      } else {
        console.log('[DCTA] Form submitted (reference mode). Wire action to PMG webhook:', data);
        setTimeout(done, 350);
      }
    });
  });

  /* ---- footer year ---- */
  var y = document.querySelector('[data-year]');
  if(y) y.textContent = new Date().getFullYear();

  /* ---- back to top ---- */
  var toTop = document.getElementById('toTop');
  if(toTop){
    var onScroll = function(){
      if(window.pageYOffset > 600) toTop.classList.add('show');
      else toTop.classList.remove('show');
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
    toTop.addEventListener('click', function(){
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({top:0, behavior: reduce ? 'auto' : 'smooth'});
    });
  }
})();
