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

/* ============================================================
   公共：带退场动画的隐藏
   搜索弹层、灯箱、螃蟹气泡都是"出现有动画、消失一刀两断"，本来各写
   各的容易变成三个碰巧长得像的实现。统一在这里：加 .closing → 等动画
   结束 → 真正隐藏并收尾；同时带兜底定时器，系统关掉动效或 animationend
   因故没触发时也一定关得掉。
   watch 传谁的 animationend 算数（通常是里面那个真正在动的面板/图片），
   不传就监听元素自己。
   ============================================================ */
function exitThenHide(el, opts) {
  opts = opts || {};
  if (el.hidden || el.dataset.closing === "1") return;
  el.dataset.closing = "1";
  el.classList.add("closing");

  var watch = opts.watch || el;
  var timer = 0;

  function done() {
    clearTimeout(timer);
    watch.removeEventListener("animationend", onEnd);
    el.classList.remove("closing");
    el.hidden = true;
    delete el.dataset.closing;
    if (opts.after) opts.after();
  }
  function onEnd(ev) {
    if (ev.target !== watch) return;   /* 只认它自己的动画，不认内部冒泡上来的 */
    done();
  }

  watch.addEventListener("animationend", onEnd);
  timer = setTimeout(done, opts.fallback || 260);
}

/* ============================================================
   公共：复制到剪贴板
   navigator.clipboard 只在安全上下文（https / localhost）存在。用
   hexo server 通过 http://局域网IP 在手机上预览时它是 undefined，
   原先三处直接 .then() 会抛未捕获异常、且用户看不到任何反馈。
   这里统一兜底：优先用异步 API，不可用时退回 execCommand，
   并把成败通过回调交出去，由调用方决定怎么提示。
   ============================================================ */
function copyText(text, onDone) {
  function ok() { if (onDone) onDone(true); }
  function fail() { if (onDone) onDone(false); }
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(ok, fallback);
  } else {
    fallback();
  }
  function fallback() {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:-9999px;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      var done = document.execCommand("copy");
      document.body.removeChild(ta);
      done ? ok() : fail();
    } catch (e) { fail(); }
  }
}

/* 重新打开时取消尚未走完的退场，避免残留 .closing 把新的入场动画压掉 */
function cancelExit(el) {
  el.classList.remove("closing");
  delete el.dataset.closing;
}

(function () {
  "use strict";

  /* ---------- 1. 主题切换（localStorage 永久记忆，其次跟随系统） ---------- */
  var root = document.documentElement;

  function applyTheme(mode) {
    root.setAttribute("data-theme", mode);
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
          /* 用 scaleX 而不是改 width：width 每帧都要重新布局，而进度条
             是全站跑得最频繁的一段动画（每篇文章的每一次滚动）。
             缩放走合成器，滚动时主线程一帧布局都不用做 */
          var p = max > 0 ? h.scrollTop / max : 0;
          bar.style.transform = "scaleX(" + p + ")";
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

        /* 滑动指示条：只挪一个物理对象的 transform，不逐项切换背景。
           但"挪动的轨迹"只在滚动经过途中各项时才讲得通——点击是瞬移，
           用户没有真的看着它划过中间那些无关的项，所以点击必须瞬间归位，
           不能假装一次没发生过的"滑过"。 */
        var indicator = document.createElement("span");
        indicator.className = "toc-indicator";
        tocPanel.appendChild(indicator);

        var hasPositioned = false;
        function activate(id, instant) {
          var target = null;
          links.forEach(function (l) {
            var isActive = l.getAttribute("href") === "#" + id;
            l.classList.toggle("active", isActive);
            if (isActive) target = l;
          });
          if (!target) return;
          var skipTravel = instant || !hasPositioned;  /* 首次出现同样不该有"从哪里飞过来"的轨迹 */
          if (skipTravel) tocPanel.classList.add("toc-no-anim");
          indicator.style.height = target.offsetHeight + "px";
          indicator.style.transform = "translateY(" + target.offsetTop + "px)";
          indicator.style.opacity = "1";
          if (skipTravel) {
            void indicator.offsetWidth;  /* 强制回流，让下一次变化能重新用回动画 */
            tocPanel.classList.remove("toc-no-anim");
          }
          hasPositioned = true;
        }
        var clickLock = 0;
        tocPanel.addEventListener("click", function (e) {
          var a = e.target.closest("a");
          if (!a) return;
          activate(a.getAttribute("href").slice(1), true);
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

    var lastFocused = null;

    function open(e) {
      cancelExit(overlay);
      /* 记住是谁打开的，关闭后把焦点还回去——否则焦点掉回 body，
         键盘用户关掉弹层后要从页面最顶上重新 Tab 一遍 */
      lastFocused = document.activeElement;
      overlay.hidden = false;
      document.body.style.overflow = "hidden";   /* 弹层打开时锁定背景滚动 */
      /* 展开原点对准触发它的按钮——横竖两轴都对准，弹层才是真的
         "从那个按钮长出来"，只对准横轴的话它仍然是从自己顶边展开的 */
      var trigger = (e && e.currentTarget) || openBtn;
      var panel = overlay.querySelector(".search-panel");
      if (panel && trigger) {
        var tRect = trigger.getBoundingClientRect();
        var pRect = panel.getBoundingClientRect();
        panel.style.transformOrigin =
          (tRect.left + tRect.width / 2 - pRect.left) + "px " +
          (tRect.top + tRect.height / 2 - pRect.top) + "px";
      }
      input.focus();
      if (!index) {
        /* 路径由模板经 url_for 注入到 body[data-search]，不再硬编码 "/"。
           站点若部署在子路径（项目站）下，硬编码的根路径会 404。 */
        var idxUrl = document.body.dataset.search || "/search.json";
        fetch(idxUrl).then(function (r) { return r.json(); })
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
      /* 输入内容与结果留到退场结束后再清，否则会看到"文字先消失、
         容器再收起"，一个动作被拆成了两段 */
      exitThenHide(overlay, {
        watch: overlay.querySelector(".search-panel"),
        after: function () {
          document.body.style.overflow = "";
          input.value = "";
          resultBox.innerHTML = "";
          if (lastFocused && lastFocused.focus) lastFocused.focus();
          lastFocused = null;
        }
      });
    }

    openBtn.addEventListener("click", open);
    /* 404 页的"搜索一下"按钮复用同一入口 */
    var e404Btn = document.getElementById("e404-search");
    if (e404Btn) e404Btn.addEventListener("click", open);
    document.getElementById("search-close").addEventListener("click", close);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    /* 焦点陷阱：aria-modal 只是告诉辅助技术"背后不可达"，键盘 Tab 并不会
       自己被挡住，得手动把焦点圈在弹层内部。
       ★ 选择器必须带上 a[href]：搜索结果是动态插入的 <a>，漏掉它的话
       last 会落在关闭按钮上，Tab 直接跳回输入框——搜索结果反而变得
       键盘不可达，比不做陷阱更糟。每次改弹层内部结构都回来确认一遍。 */
    overlay.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var f = overlay.querySelectorAll("a[href], input, button");
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

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
        copyText(code.innerText.replace(/\n+$/, "\n"), function (ok) {
          btn.textContent = ok ? "已复制" : "复制失败";
          btn.classList.toggle("done", ok);
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
        copyText(location.href, function (ok) {
          if (!ok) return;
          a.classList.add("done");
          setTimeout(function () { a.classList.remove("done"); }, 1200);
        });
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
      cancelExit(bubble);
      bubble.hidden = false;
      clearTimeout(timer);
      timer = setTimeout(function () {
        exitThenHide(bubble, { after: function () { setFace("normal"); } });
      }, 2600);
    });

    crab.addEventListener("dblclick", function () {
      bubble.textContent = "溜了溜了！";
      setFace("wow");
      cancelExit(bubble);
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
    function show(i, dir) {
      var items = visibleItems();
      if (!items.length) return;
      current = (i + items.length) % items.length;
      var img = items[current].querySelector("img");
      /* 先把已经在缓存里的缩略图顶上，避免大图下载期间灯箱一片空白；
         大图预载完成后再换掉。dataset.want 是防串台的标记：连点上/下一张时，
         先发出的请求可能后到达，没有它就会出现"停在第 3 张、显示第 2 张"。 */
      lbImg.src = img.src;
      var large = img.dataset.large;
      lbImg.dataset.want = large || img.src;
      if (large && large !== img.src) {
        var pre = new Image();
        pre.onload = function () {
          if (lbImg.dataset.want === large) lbImg.src = large;
        };
        pre.src = large;
      }
      lbImg.alt = img.alt;
      lbTitle.textContent = img.dataset.title;
      lbMeta.textContent = img.dataset.meta;
      lbCounter.textContent = (current + 1) + " / " + items.length;
      cancelExit(lb);
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      /* 按切换方向选动画类；强制回流让同名 animation 能连续重放 */
      lbImg.classList.remove("lb-in", "lb-in-next", "lb-in-prev");
      void lbImg.offsetWidth;
      lbImg.classList.add(dir === 1 ? "lb-in-next" : dir === -1 ? "lb-in-prev" : "lb-in");
    }
    function close() {
      exitThenHide(lb, {
        watch: lb.querySelector(".lb-stage"),
        after: function () { document.body.style.overflow = ""; }
      });
    }

    wall.addEventListener("click", function (e) {
      var item = e.target.closest(".photo-item");
      if (!item) return;
      show(visibleItems().indexOf(item));
    });
    document.getElementById("lb-close").addEventListener("click", close);
    document.getElementById("lb-prev").addEventListener("click", function () { show(current - 1, -1); });
    document.getElementById("lb-next").addEventListener("click", function () { show(current + 1, 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1, -1);
      if (e.key === "ArrowRight") show(current + 1, 1);
    });

    /* 触屏左右滑动切换 */
    var touchX = null;
    lb.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
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
        copyText(btn.dataset.copy, function (ok) {
          btn.innerHTML = ok ? "已复制 ✓" : "复制失败，请手动选取";
          btn.classList.toggle("done", ok);
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
