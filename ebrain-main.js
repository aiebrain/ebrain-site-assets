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

    /* 인트로 게이트 */
    var cursor = document.getElementById('rt-cursor');
    intro.addEventListener('mousemove', function (e) {
      if (!cursor) return;
      cursor.style.display = 'flex';
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
    intro.addEventListener('mouseleave', function () { if (cursor) cursor.style.display = 'none'; });
    var dismiss = function () {
      intro.classList.add('gone');
      if (cursor) cursor.style.display = 'none';
    };
    intro.addEventListener('click', dismiss);
    setTimeout(dismiss, 6000);
    window.addEventListener('wheel', dismiss, { once: true, passive: true });
    window.addEventListener('touchmove', dismiss, { once: true, passive: true });

    /* 스크롤 리빌 */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });

    /* (02) THE BOOK 아코디언 토글 */
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
