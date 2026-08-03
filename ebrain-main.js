/* EBRAIN AI 직원 OS 메인페이지 스크립트 (아임웹 코드 위젯용)
   아임웹은 인라인 스크립트를 실행하지 않으므로 외부 파일로 로드한다.
   위젯 HTML이 나중에 삽입될 수 있어 요소가 생길 때까지 폴링 후 초기화. */
(function () {
  var tries = 0;
  function boot() {
    var intro = document.getElementById('rt-intro');
    var reveals = document.querySelectorAll('.reveal');
    if (!intro || reveals.length === 0) {
      if (tries++ < 100) return setTimeout(boot, 100);
      return;
    }

    /* ---- 인트로 게이트 (therootstudio.co.kr 방식 시네마틱 시퀀스) ---- */
    /* JS가 붙었으므로 CSS 자동 해제 안전장치를 끈다. JS 미로드 시엔 CSS가 8초 후 해제. */
    intro.classList.add('js-armed');

    var cursor = document.getElementById('rt-cursor');
    var bg = intro.querySelector('.intro-bg');
    var header = intro.querySelector('.intro-top');
    var mid = intro.querySelector('.intro-mid');
    var cta = intro.querySelector('.intro-bot');
    var texts = document.getElementById('rt-texts');
    var lines = [].slice.call(intro.querySelectorAll('.intro-line'));
    var define = document.getElementById('rt-define');
    var enterHint = document.getElementById('rt-enter-hint');
    var entered = false;

    function isMobile() { return window.matchMedia('(max-width: 640px)').matches; }
    function rowSize() {
      return isMobile() ? 'clamp(1.4rem, 7vw, 2.4rem)' : 'clamp(2.3rem, 7vh, 4.7rem)';
    }
    function rowGap() {
      return isMobile() ? 'clamp(0.18rem, 1.2vw, 0.38rem)' : 'clamp(0.35rem, 0.9vw, 0.85rem)';
    }

    var timers = [];
    function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function lockScroll() {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }
    function unlockScroll() {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }

    /* 한 줄 폭이 뷰포트를 넘으면 가로로 눌러 맞춘다 (문장이 원본보다 길어 전 해상도 가드) */
    function fitRow() {
      texts.style.transformOrigin = 'center center';
      texts.style.transform = 'none';
      var cs = getComputedStyle(texts);
      var gap = parseFloat(cs.columnGap || cs.gap) || 0;
      var w = lines.reduce(function (s, l) { return s + l.offsetWidth; }, 0) + gap * (lines.length - 1);
      var avail = Math.max(280, window.innerWidth - 24);
      if (w > avail) texts.style.transform = 'scaleX(' + (avail / w) + ')';
    }

    /* FLIP: 세로로 쌓인 큰 글자들을 가로 한 줄로 재배열 */
    function rearrangeToRow() {
      var first = lines.map(function (l) { return l.getBoundingClientRect(); });

      texts.classList.add('is-row');
      texts.style.flexDirection = 'row';
      texts.style.flexWrap = 'nowrap';
      texts.style.maxWidth = '100vw';
      texts.style.gap = rowGap();
      lines.forEach(function (l) {
        l.style.transition = 'none';
        l.style.transform = 'none';
        l.style.fontSize = rowSize();
        l.style.letterSpacing = isMobile() ? '0.015em' : '0.16em';
        l.style.textIndent = isMobile() ? '0.015em' : '0.16em';
      });
      fitRow();

      var last = lines.map(function (l) { return l.getBoundingClientRect(); });
      lines.forEach(function (l, i) {
        var dx = first[i].left - last[i].left;
        var dy = first[i].top - last[i].top;
        var s = last[i].height ? (first[i].height / last[i].height) : 1;
        l.style.transformOrigin = 'left top';
        l.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')';
      });

      setTimeout(function () {
        lines.forEach(function (l) {
          l.style.transition = 'transform 1.6s cubic-bezier(0.16,1,0.3,1)';
          l.style.transform = 'none';
        });
      }, 40);
    }

    function runSequence() {
      lockScroll();
      /* CRO v2 (2026-08-03): 시퀀스 7.3초→2.6초 압축 + 클릭 강제 제거(자동 입장).
         클릭·휠·터치는 언제든 즉시 입장. */
      /* Phase 0 — 아웃라인 글자가 아래에서 순차 등장 */
      at(150, function () { lines[0].classList.add('is-in'); });
      at(300, function () { lines[1].classList.add('is-in'); });
      at(450, function () { lines[2].classList.add('is-in'); });
      at(600, function () { lines[3].classList.add('is-in'); });
      /* Phase 1 — 한 줄씩 흰색으로 점등 */
      at(900,  function () { lines[0].classList.add('text-stroke-active'); });
      at(1100, function () { lines[1].classList.add('text-stroke-active'); });
      at(1300, function () { lines[2].classList.add('text-stroke-active'); });
      at(1500, function () { lines[3].classList.add('text-stroke-active'); });
      /* Phase 2 — 가로 한 줄로 재배열 */
      at(1900, rearrangeToRow);
      /* Phase 3 — 서브 태그라인 + 입장 힌트 동시 상승 */
      at(2400, function () {
        define.style.opacity = '1';
        define.style.transform = 'translateY(0)';
        enterHint.style.opacity = '1';
        enterHint.style.transform = 'translateY(0)';
      });
      at(2600, function () {
        lines.forEach(function (l) { l.style.transition = ''; });
        texts.classList.add('intro-ready');
      });
      /* Phase 4 — 자동 입장 (클릭 불필요) */
      at(3200, enterSite);
    }

    /* 클릭 입장: 인트로 콘텐츠가 먼지처럼 흩어지며 본문 공개 */
    function enterSite() {
      if (entered) return;
      entered = true;
      clearTimers();
      var mobile = window.matchMedia('(max-width: 640px), (pointer: coarse)').matches;
      var dustId = mobile ? 'rt-dust-mobile' : 'rt-dust';

      if (cursor) cursor.style.opacity = '0';
      if (bg) {
        bg.style.transition = 'transform 1.15s cubic-bezier(0.22,1,0.36,1), filter 1.1s ease';
        bg.style.filter = 'brightness(1.3)';
        bg.style.transform = 'scale(1.13)';
      }
      [header, mid, cta].forEach(function (el) {
        if (!el) return;
        el.style.filter = 'url(#' + dustId + ')';
        el.style.transition = 'opacity 1.05s ease, transform 1.2s cubic-bezier(0.32,0,0.42,1)';
        el.style.opacity = '0';
        el.style.transform = 'translateY(-22px) scale(1.04)';
      });
      [dustId + '-scale', dustId + '-blur'].forEach(function (id) {
        var a = document.getElementById(id);
        if (a && a.beginElement) { try { a.beginElement(); } catch (e) {} }
      });
      intro.style.pointerEvents = 'none';
      setTimeout(function () {
        intro.style.transition = 'opacity 0.7s ease, visibility 0.7s';
        intro.classList.add('gone');
        unlockScroll();
      }, 550);
    }

    /* 커스텀 커서 + 배경 패럴랙스 */
    window.addEventListener('mousemove', function (e) {
      if (entered || intro.classList.contains('gone')) return;
      var cx = e.clientX / window.innerWidth - 0.5;
      var cy = e.clientY / window.innerHeight - 0.5;
      if (bg) bg.style.transform = 'scale(1.08) translate(' + (cx * -14) + 'px,' + (cy * -14) + 'px)';
      if (cursor) {
        cursor.style.display = 'flex';
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        cursor.style.opacity = '1';
      }
    });
    intro.addEventListener('mouseleave', function () { if (cursor) cursor.style.opacity = '0'; });
    intro.addEventListener('click', enterSite);
    window.addEventListener('wheel', enterSite, { once: true, passive: true });
    window.addEventListener('touchmove', enterSite, { once: true, passive: true });
    window.addEventListener('resize', function () {
      if (entered || !texts.classList.contains('is-row')) return;
      lines.forEach(function (l) { l.style.fontSize = rowSize(); });
      texts.style.gap = rowGap();
      fitRow();
    });

    /* CRO v3 (2026-08-03): 인트로는 세션당 1회만 재생 — 상품 페이지에서 돌아올 때 즉시 본문 */
    var introSeen = false;
    try { introSeen = !!sessionStorage.getItem('rtIntroSeen'); } catch (e) {}
    if (introSeen) {
      entered = true;
      intro.style.transition = 'none';
      intro.classList.add('gone');
      if (cursor) cursor.style.display = 'none';
    } else {
      try { sessionStorage.setItem('rtIntroSeen', '1'); } catch (e) {}
      try { runSequence(); } catch (e) { enterSite(); }
    }

    /* ---- 스크롤 리빌 ---- */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });

    /* ---- (02) THE BOOK 아코디언 토글 ---- */
    var row = document.getElementById('book-toggle');
    var panel = document.getElementById('book-panel');
    if (row && panel) {
      row.addEventListener('click', function () {
        panel.classList.toggle('open');
        row.classList.toggle('on');
      });
      /* 히어로의 "전자책 살펴보기" 앵커 클릭 시 자동으로 펼침 */
      document.querySelectorAll('a[href="#book"]').forEach(function (a) {
        a.addEventListener('click', function () {
          panel.classList.add('open');
          row.classList.add('on');
        });
      });
    }
  }
  boot();
})();
