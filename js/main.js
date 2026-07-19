/* Material 主题脚本 · 无依赖
   功能：深浅色切换 / 阅读进度 / 目录高亮 / 移动端菜单 …… */

/* ============================================================
   首页随机格言池（哲学 / 心理学）
   · text 为格言，by 为出处，crab 为小螃蟹对这句话的戏仿台词
   · 每句均核实过原始出处，新增条目前请先查证，勿凭记忆添加
   ============================================================ */
var HERO_QUOTES = [
  { text: "凡不能毁灭我的，必使我更强大。",
    by: "尼采《偶像的黄昏》",
    crab: ["凡不能毁灭螃蟹的，必使蟹壳更硬", "happy"] },
  { text: "当你长久凝视深渊时，深渊也在凝视你。",
    by: "尼采《善恶的彼岸》",
    crab: ["你凝视螃蟹时，螃蟹也在凝视你", "wow"] },
  { text: "人生如钟摆，在痛苦与无聊之间来回摆动。",
    by: "叔本华《作为意志和表象的世界》",
    crab: ["人生在痛苦与无聊间摆动，螃蟹在左与右之间横行", "normal"] },
  { text: "肉体的死亡可以摧毁我们，但死亡的观念却能拯救我们。",
    by: "欧文·亚隆《直视骄阳》",
    crab: ["蟹生有限，所以今天也要认真横行", "normal"] },
  { text: "在隆冬，我终于知道，我身上有一个不可战胜的夏天。",
    by: "加缪《重返蒂巴萨》",
    crab: ["我身上也有一个不可战胜的夏天，和两只钳子", "happy"] },
  { text: "在任何境遇中选择自己态度的自由，是谁也无法剥夺的。",
    by: "弗兰克尔《活出生命的意义》",
    crab: ["谁也不能剥夺螃蟹横着走的自由", "happy"] },
  { text: "向外看的人在做梦，向内看的人才清醒。",
    by: "荣格（1916 年书信）",
    crab: ["向外看的人在做梦，向内看的螃蟹刚睡醒", "sleepy"] },
  { text: "生活只能倒着理解，却必须向前经历。",
    by: "克尔凯郭尔（1843 年日记）",
    crab: ["生活必须向前经历，可我只会横着走", "normal"] },
  { text: "万物皆有裂痕，那是光照进来的地方。",
    by: "莱昂纳德·科恩《颂歌》",
    crab: ["万物皆有裂痕，包括蟹壳", "normal"] }
];

/* ---------- 0. 随机格言（首页与关于页，会话内保持同一句） ---------- */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    var hero = document.getElementById("hero-quote");
    var el = hero || document.getElementById("about-quote");
    if (!el) return;
    /* 首页每次访问重新抽签并记下来；关于页跟随本次会话首页抽到的那句 */
    var i = hero ? -1 : parseInt(sessionStorage.getItem("quote-idx"), 10);
    if (isNaN(i) || i < 0 || i >= HERO_QUOTES.length) {
      i = Math.floor(Math.random() * HERO_QUOTES.length);
    }
    sessionStorage.setItem("quote-idx", i);
    var q = HERO_QUOTES[i];
    el.textContent = q.text;
    var by = document.createElement("span");
    by.className = "quote-by";
    by.textContent = "—— " + q.by;
    el.appendChild(by);
    /* 记下本次展示的格言，供小螃蟹联动吐槽 */
    document.body.dataset.quote = i;
  });
})();

(function () {
  "use strict";

  /* ---------- 1. 主题切换（localStorage 永久记忆，其次跟随系统） ---------- */
  var root = document.documentElement;

  function applyTheme(mode) {
    root.setAttribute("data-theme", mode);
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.querySelector(".i-moon").style.display = mode === "dark" ? "none" : "";
      btn.querySelector(".i-sun").style.display = mode === "dark" ? "" : "none";
    }
  }

  function currentPref() {
    var saved = localStorage.getItem("theme");
    if (saved) return saved;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(currentPref());

    var btn = document.getElementById("theme-toggle");
    if (btn) btn.addEventListener("click", function (e) {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
        applyTheme(next);
        return;
      }
      var x = e.clientX || innerWidth - 40, y = e.clientY || 32;
      var r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      root.classList.add("vt-lock");
      var vt = document.startViewTransition(function () { applyTheme(next); });
      vt.finished.finally(function () { root.classList.remove("vt-lock"); });
      vt.ready.then(function () {
        document.documentElement.animate(
          { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + r + "px at " + x + "px " + y + "px)"] },
          { duration: 450, easing: "cubic-bezier(.2,0,0,1)", pseudoElement: "::view-transition-new(root)" }
        );
      });
    });

    /* 未手动选择时，跟随系统变化 */
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
      if (!localStorage.getItem("theme")) applyTheme(e.matches ? "dark" : "light");
    });

    /* ---------- 2. 移动端菜单 ---------- */
    var mt = document.getElementById("menu-toggle");
    var nav = document.querySelector(".top-nav");
    var topBarEl = document.querySelector(".top-bar");
    if (mt && nav) {
      var setNav = function (open) {
        nav.classList.toggle("open", open);
        if (topBarEl) topBarEl.classList.toggle("menu-open", open);
      };
      mt.addEventListener("click", function () {
        setNav(!nav.classList.contains("open"));
      });
      /* 点了菜单项、或点菜单以外区域，自动收起 */
      nav.addEventListener("click", function (e) {
        if (e.target.closest("a")) setNav(false);
      });
      document.addEventListener("click", function (e) {
        if (nav.classList.contains("open") && !e.target.closest(".top-bar")) setNav(false);
      });
    }

    /* ---------- 3. 阅读进度条 ---------- */
    var bar = document.querySelector(".read-progress");
    if (bar) {
      var ticking = false;
      addEventListener("scroll", function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var h = document.documentElement;
          var max = h.scrollHeight - h.clientHeight;
          bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
          ticking = false;
        });
      }, { passive: true });
    }

    /* ---------- 4. 目录生成 + 滚动高亮 ---------- */
    var tocPanel = document.getElementById("toc");
    var article = document.querySelector(".prose");
    if (tocPanel && article) {
      var heads = article.querySelectorAll("h2, h3");
      if (heads.length < 2) {
        tocPanel.remove();
      } else {
        var links = [];
        heads.forEach(function (h, i) {
          if (!h.id) h.id = "sec-" + i;
          var a = document.createElement("a");
          a.href = "#" + h.id;
          a.textContent = h.textContent;
          a.dataset.level = h.tagName === "H3" ? "3" : "2";
          tocPanel.appendChild(a);
          links.push(a);
        });

        function activate(id) {
          links.forEach(function (l) { l.classList.toggle("active", l.getAttribute("href") === "#" + id); });
        }
        var clickLock = 0;
        tocPanel.addEventListener("click", function (e) {
          var a = e.target.closest("a");
          if (!a) return;
          activate(a.getAttribute("href").slice(1));
          clickLock = Date.now() + 800;  /* 跳转后短暂锁定，避免滚动判定抢走高亮 */
        });
        var io = new IntersectionObserver(function (entries) {
          if (Date.now() < clickLock) return;
          entries.forEach(function (en) {
            if (en.isIntersecting) activate(en.target.id);
          });
        }, { rootMargin: "-8% 0px -70% 0px" });

        heads.forEach(function (h) { io.observe(h); });
      }
    }
  });
})();

/* ---------- 5. 全站搜索 ---------- */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    var overlay = document.getElementById("search-overlay");
    var openBtn = document.getElementById("search-open");
    if (!overlay || !openBtn) return;

    var input = document.getElementById("search-input");
    var resultBox = document.getElementById("search-results");
    var index = null;

    function open() {
      overlay.hidden = false;
      document.body.style.overflow = "hidden";   /* 弹层打开时锁定背景滚动 */
      input.focus();
      if (!index) {
        fetch("/search.json").then(function (r) { return r.json(); })
          .then(function (d) {
            index = Array.isArray(d) ? d : [];
            /* 索引就位后，如果用户已经输入了内容，立即补跑一次过滤 */
            if (input.value.trim()) input.dispatchEvent(new Event("input"));
          })
          .catch(function () {
            resultBox.innerHTML = '<div class="r-empty">索引加载失败：请确认已安装 hexo-generator-search</div>';
          });
      }
    }
    function close() {
      overlay.hidden = true;
      document.body.style.overflow = "";
      input.value = "";
      resultBox.innerHTML = "";
    }

    openBtn.addEventListener("click", open);
    /* 404 页的"搜索一下"按钮复用同一入口 */
    var e404Btn = document.getElementById("e404-search");
    if (e404Btn) e404Btn.addEventListener("click", open);
    document.getElementById("search-close").addEventListener("click", close);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !overlay.hidden) close();
      if (e.key === "/" && overlay.hidden && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
        e.preventDefault(); open();
      }
    });

    function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      resultBox.innerHTML = "";
      if (!q || !index) return;
      var hits = [];
      for (var i = 0; i < index.length && hits.length < 8; i++) {
        var item = index[i];
        var title = (item.title || "").toLowerCase();
        var text = (item.content || "").replace(/<[^>]+>/g, "");
        var pos = text.toLowerCase().indexOf(q);
        if (title.indexOf(q) > -1 || pos > -1) hits.push({ item: item, text: text, pos: pos });
      }
      if (!hits.length) {
        resultBox.innerHTML = '<div class="r-empty">没有找到「' + esc(input.value.trim()) + '」相关的内容</div>';
        return;
      }
      hits.forEach(function (h) {
        var a = document.createElement("a");
        a.href = h.item.url;
        var t = esc(h.item.title || "无标题");
        var re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
        var snippet = h.pos > -1
          ? esc(h.text.substring(Math.max(0, h.pos - 30), h.pos + 60))
          : esc(h.text.substring(0, 90));
        a.innerHTML = '<div class="r-title">' + t.replace(re, "<mark>$1</mark>") + '</div>' +
                      '<div class="r-snippet">' + snippet + '</div>';
        resultBox.appendChild(a);
      });
    });
  });
})();


/* ---------- 6. 顶栏滚动感知 / 代码块增强 / 标题锚点 ---------- */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    /* 顶栏：滚动后才浮现底色 */
    var topBar = document.querySelector(".top-bar");
    if (topBar) {
      var sync = function () { topBar.classList.toggle("scrolled", scrollY > 8); };
      addEventListener("scroll", sync, { passive: true });
      sync();
    }

    /* 代码块：语言标签 + 复制按钮 */
    document.querySelectorAll(".prose figure.highlight, .prose > pre").forEach(function (block) {
      var lang = "";
      (block.className || "").split(/\s+/).forEach(function (c) {
        if (c && c !== "highlight" && c !== "hljs" && c !== "plaintext") lang = lang || c;
      });
      var wrap = document.createElement("div");
      wrap.className = "code-wrap";
      block.parentNode.insertBefore(wrap, block);
      wrap.appendChild(block);
      if (lang) {
        var tag = document.createElement("span");
        tag.className = "code-lang";
        tag.textContent = lang;
        wrap.appendChild(tag);
      }
      var btn = document.createElement("button");
      btn.className = "code-copy";
      btn.type = "button";
      btn.textContent = "复制";
      btn.addEventListener("click", function () {
        var code = block.querySelector(".code") || block;
        navigator.clipboard.writeText(code.innerText.replace(/\n+$/, "\n")).then(function () {
          btn.textContent = "已复制";
          btn.classList.add("done");
          setTimeout(function () { btn.textContent = "复制"; btn.classList.remove("done"); }, 1600);
        });
      });
      wrap.appendChild(btn);
    });

    /* 标题锚点：悬停浮现 #，点击复制章节链接 */
    document.querySelectorAll(".prose h2[id], .prose h3[id]").forEach(function (h) {
      var a = document.createElement("a");
      a.className = "anchor";
      a.href = "#" + h.id;
      a.textContent = "#";
      a.setAttribute("aria-label", "复制本节链接");
      a.addEventListener("click", function (e) {
        e.preventDefault();
        history.replaceState(null, "", "#" + h.id);
        navigator.clipboard.writeText(location.href);
        a.classList.add("done");
        setTimeout(function () { a.classList.remove("done"); }, 1200);
      });
      h.appendChild(a);
    });
  });
})();

/* ---------- 7. 像素小螃蟹彩蛋 ---------- */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    var crab = document.getElementById("crab");
    if (!crab) return;
    if (sessionStorage.getItem("crab-away")) { crab.remove(); return; }

    var bubble = document.getElementById("crab-bubble");
    /* 每句台词带表情：normal / happy / wow / sleepy */
    var lines = [
      ["你来啦 🦀", "happy"],
      ["今天也要好好写博客哦", "happy"],
      ["按 / 可以快速搜索～", "normal"],
      ["横着走才是人生正道", "normal"],
      ["咦？这篇文章你还没读完", "wow"],
      ["夜深了的话，记得开夜间模式", "sleepy"],
      ["别戳了，怪痒的", "wow"],
      ["双击我会发生什么呢？", "happy"],
      ["Zzz……啊？我没睡", "sleepy"]
    ];
    /* 与首页格言联动：首页加入"当前展示那句"的戏仿版（加两次提高出现率），
       其他页面随机带一句哲学戏仿，让螃蟹保持一点哲学家气质 */
    if (typeof HERO_QUOTES !== "undefined") {
      var qi = document.body.dataset.quote;
      var riff = (qi !== undefined && HERO_QUOTES[qi])
        ? HERO_QUOTES[qi].crab
        : HERO_QUOTES[Math.floor(Math.random() * HERO_QUOTES.length)].crab;
      if (riff) {
        lines.push(riff);
        if (qi !== undefined) lines.push(riff);
      }
    }
    var timer = null, lastIdx = -1;

    function setFace(f) { crab.setAttribute("data-face", f); }

    crab.addEventListener("mouseenter", function () {
      if (bubble.hidden) setFace("happy");
    });
    crab.addEventListener("mouseleave", function () {
      if (bubble.hidden) setFace("normal");
    });

    crab.addEventListener("click", function () {
      var i;
      do { i = Math.floor(Math.random() * lines.length); } while (lastIdx > -1 && lines[i][0] === lines[lastIdx][0]);
      lastIdx = i;
      bubble.textContent = lines[i][0];
      setFace(lines[i][1]);
      bubble.hidden = false;
      clearTimeout(timer);
      timer = setTimeout(function () {
        bubble.hidden = true;
        setFace("normal");
      }, 2600);
    });

    crab.addEventListener("dblclick", function () {
      bubble.textContent = "溜了溜了！";
      setFace("wow");
      bubble.hidden = false;
      crab.classList.add("runaway");
      sessionStorage.setItem("crab-away", "1");
      setTimeout(function () { crab.remove(); }, 1100);
    });
  });
})();

/* ---------- 8. 摄影墙：筛选 + 灯箱 ---------- */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    var wall = document.getElementById("photo-wall");
    if (!wall) return;

    /* 标签筛选 */
    var filters = document.getElementById("gallery-filters");
    if (filters) {
      filters.addEventListener("click", function (e) {
        var chip = e.target.closest(".filter-chip");
        if (!chip) return;
        filters.querySelectorAll(".filter-chip").forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        var tag = chip.dataset.tag;
        wall.querySelectorAll(".photo-item").forEach(function (item) {
          item.classList.toggle("filtered-out", tag !== "*" && item.dataset.tag !== tag);
        });
      });
    }

    /* 灯箱 */
    var lb = document.getElementById("lightbox");
    var lbImg = document.getElementById("lb-img");
    var lbTitle = document.getElementById("lb-title");
    var lbMeta = document.getElementById("lb-meta");
    var lbCounter = document.getElementById("lb-counter");
    var current = 0;

    function visibleItems() {
      return [].slice.call(wall.querySelectorAll(".photo-item:not(.filtered-out)"));
    }
    function show(i) {
      var items = visibleItems();
      if (!items.length) return;
      current = (i + items.length) % items.length;
      var img = items[current].querySelector("img");
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbTitle.textContent = img.dataset.title;
      lbMeta.textContent = img.dataset.meta;
      lbCounter.textContent = (current + 1) + " / " + items.length;
      lb.hidden = false;
      document.body.style.overflow = "hidden";
    }
    function close() {
      lb.hidden = true;
      document.body.style.overflow = "";
    }

    wall.addEventListener("click", function (e) {
      var item = e.target.closest(".photo-item");
      if (!item) return;
      show(visibleItems().indexOf(item));
    });
    document.getElementById("lb-close").addEventListener("click", close);
    document.getElementById("lb-prev").addEventListener("click", function () { show(current - 1); });
    document.getElementById("lb-next").addEventListener("click", function () { show(current + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });

    /* 触屏左右滑动切换 */
    var touchX = null;
    lb.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
      touchX = null;
    }, { passive: true });
  });
})();

/* ---------- 9. 次第浮现编排 ---------- */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    if (document.body.dataset.reveal === "off") return;
    var items = document.querySelectorAll(".hero, .about-intro, .post-card, .photo-item, .archive-list li, .archive-year");
    if (!items.length) return;

    var batch = 0, lastTime = 0;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var now = performance.now();
        if (now - lastTime > 350) batch = 0;   /* 新一屏重新起拍 */
        lastTime = now;
        en.target.style.transitionDelay = Math.min(batch++ * 40, 200) + "ms";
        en.target.classList.add("revealed");
        io.unobserve(en.target);
      });
    }, { threshold: .06 });

    items.forEach(function (el) { io.observe(el); });
  });
})();

/* ---------- 10. 点击复制（关于页邮箱等，data-copy 属性通用） + 模糊剧透 ---------- */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-copy]").forEach(function (btn) {
      var original = btn.innerHTML;
      var timer = null;
      btn.addEventListener("click", function () {
        navigator.clipboard.writeText(btn.dataset.copy).then(function () {
          btn.innerHTML = "已复制 ✓";
          btn.classList.add("done");
          clearTimeout(timer);
          timer = setTimeout(function () {
            btn.innerHTML = original;
            btn.classList.remove("done");
          }, 1500);
        });
      });
    });

    /* 模糊剧透：悬停临时显示，点按/回车固定切换（触屏与键盘可用） */
    document.querySelectorAll(".spoiler").forEach(function (s) {
      if (!s.hasAttribute("tabindex")) s.setAttribute("tabindex", "0");
      var toggle = function () { s.classList.toggle("revealed"); };
      s.addEventListener("click", toggle);
      s.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      });
    });
  });
})();
