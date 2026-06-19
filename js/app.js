(function() {
"use strict";
var D = {};
var state = { theme: "literary", view: "rendered", html: "", blocks: [], dsKey: "", fontSizes: { title: 1.45, heading: 1.15, body: 0.9 } };
var toastTimer;

function $(id) { return document.getElementById(id); }
function $$(sel) { return document.querySelectorAll(sel); }
function initDom() {
  D.editor = $("editor"); D.charCount = $("charCount");
  D.preview = $("previewOutput"); D.renderedView = $("renderedView");
  D.sourceView = $("sourceView"); D.sourceCode = $("sourceCode");
  D.styleTabs = $$(".style-tab"); D.previewTabs = $$(".preview-tab");
  D.templateSelect = $("templateSelect"); D.loadTemplateBtn = $("loadTemplateBtn");
  D.smartFormatBtn = $("smartFormatBtn"); D.clearBtn = $("clearEditorBtn");
  D.copyBtn = $("copyBtn"); D.copyHtmlBtn = $("copyHtmlBtn"); D.previewBtn = $("previewBtn");
  D.toast = $("toast"); D.themeToggle = $("themeToggleBtn");
  D.exportBtn = $("exportBtn"); D.exportModal = $("exportModal");
  D.exportCode = $("exportCode"); D.exportCopyBtn = $("exportCopyBtn");
  D.exportCloseBtn = $("exportCloseBtn");
  D.apiKeyInput = $("apiKeyInput"); D.apiSaveBtn = $("apiSaveBtn");
  D.apiStatus = $("apiStatus"); D.settingsPanel = $("settingsPanel");
  D.settingsBtn = $("settingsBtn");
  D.fontDecBtns = $$(".font-dec"); D.fontIncBtns = $$(".font-inc");
  D.titleSizeVal = $("titleSizeVal"); D.headingSizeVal = $("headingSizeVal"); D.bodySizeVal = $("bodySizeVal");
}

function toast(msg, dur) {
  dur = dur || 2000; clearTimeout(toastTimer);
  D.toast.textContent = msg; D.toast.classList.add("show");
  toastTimer = setTimeout(function() { D.toast.classList.remove("show"); }, dur);
}

function initTheme() {
  var s = localStorage.getItem("wxp-theme");
  if (s === "dark") document.documentElement.setAttribute("data-theme", "dark");
  else if (!s && window.matchMedia && window.matchMedia("(prefers-color-scheme:dark)").matches)
    document.documentElement.setAttribute("data-theme", "dark");
  var k = localStorage.getItem("wxp-ds-key");
  if (k) { state.dsKey = k; if (D.apiKeyInput) D.apiKeyInput.value = k; updateApiUi(); }
}

function toggleTheme() {
  var c = document.documentElement.getAttribute("data-theme");
  var n = c === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", n);
  localStorage.setItem("wxp-theme", n);
  toast(n === "dark" ? "已切换为深色模式" : "已切换为浅色模式", 1500);
}

function updateApiUi() {
  if (state.dsKey) {
    D.apiStatus.textContent = "API Key 已配置 (" + state.dsKey.substring(0, 8) + "...)";
    D.apiStatus.style.color = "#10B981";
  } else {
    D.apiStatus.textContent = "未配置 API Key，将使用规则引擎";
    D.apiStatus.style.color = "var(--text-secondary)";
  }
}

var TEMPLATES = {};
(function() {
  var t = TEMPLATES;
  t.clean = { name: "简洁通用", text: "文章标题\n\n这是正文第一段。简洁的通用模板适合各类日常内容。段落之间保持适度留白，让阅读更为舒适。\n\n每一段落不宜太长，保持3~5行的节奏最佳。手机端阅读时屏幕较小，短段落更友好。\n\n小标题\n\n使用短句作为小标题，帮助读者快速定位内容。不要用太长的标题，简洁有力即可。\n\n> 好的排版就像好的呼吸——你不会注意到它，但它让一切更舒服。\n\n- 要点一：简洁清晰\n- 要点二：留白舒适\n- 要点三：层次分明" };
  t.rich = { name: "文艺随笔", text: "给风的一封信\n——致某个安静的下午\n\n有些日子，世界大得让人喘息。可另一些时刻，它又缩小到一个房间、一个念头、一次呼吸。\n\n我开始收集那些细小的瞬间。\n晨光穿过窗帘缝隙的方式。\n雨滴敲打玻璃的声音。\n陌生人对著手机微笑。\n热茶升起的蒸汽。\n\n关于美好的事\n\n这些碎片拼不出什么宏大的东西。但或许，这正是重点所在。\n\n> 我们不会记得日子，我们只会记得瞬间。\n\n而在这些安静的积累中，一生就这样被填满了。不需要宏大的主题，不需要刻意的意义。就像窗外的风，来了，又走了。" };
  t["anime-share"] = { name: "动漫分享", text: "【番剧推荐】葬送的芙莉莲\n——关于时间、记忆与羁绊\n\n勇者辛美尔一行人经历十年冒险，成功击败了魔王。精灵魔法使芙莉莲与伙伴们约定，五十年后再一起去看流星雨。\n\n五十年后，她如约回到王都，昔日的伙伴已垂垂老矣。辛美尔在最后一场流星雨后安详离世。\n\n角色亮点\n\n- 芙莉莲：漫长生命中迟来的成长，每一滴眼泪都让人心碎\n- 辛美尔：即便只出现在回忆中，也足够耀眼\n- 海塔：可靠的伙伴，永远的好友\n\n为什么推荐\n\n> 它不是一部\u201c热血\u201d的动画，但它让你在每一集结束后都想多活一会儿。\n\nMADHOUSE 的作画精细到每一根发丝，Evan Call 的配乐温柔到骨子里。这是一部关于\u201c之后\u201d的故事——魔王被打败之后，人生还在继续。" };
  t["reading-note"] = { name: "读书感悟", text: "读《百年孤独》\n——我们都在重复同一个名字\n\n马尔克斯用布恩迪亚家族七代人的故事，写尽了拉美百年的沧桑。每个人都在自己的命运里挣扎，却不知不觉地重复着祖辈的名字和宿命。\n\n魔幻与现实的边界\n\n在马尔克斯笔下，俏姑娘升天、雨下了四年、死人可以在院子里散步——这一切都那么自然。因为在他的世界里，魔幻就是现实的一部分。\n\n> \u201c世界太新，很多东西还没有名字，要提到的时候只能用手指指著。\u201d\n\n阅读感悟\n\n- 孤独是贯穿全书的主题，每个人都在自己的世界里孤独终老\n- 重复的名字象征著无法逃脱的家族宿命\n- 时间的循环让人感到无力，也让人思考活着的意义\n\n这本书让我明白，所谓历史不过是一次又一次的轮回。我们能做的，或许只是在轮回中找到自己的位置。" };
  t["life-musing"] = { name: "生活碎片", text: "周末碎片\n\n早上睡到自然醒，阳光已经铺满了半边床。没有闹钟的日子，连呼吸都慢了下来。\n\n煮了一壶咖啡，翻了几页书。窗外有人在遛狗，小孩在楼下追逐打闹。这些声音混杂在一起，竟成了最好的白噪音。\n\n下午去了菜市场\n\n挑了几颗番茄，一把青菜。摊主阿姨多送了两根葱，笑著说\u201c年轻人要多吃菜\u201d。这种小小的善意，比什么都治愈。\n\n> 生活不在远方，就在眼下这一蔬一饭里。\n\n晚上给自己做了顿饭。不算精致，但每一口都是对自己的温柔。" };
  t["data-processing"] = { name: "数据处理", text: "数据清洗实战：Pandas 高效处理缺失值\n\n在数据分析工作中，缺失值处理是最基础也最关键的步骤之一。本文介绍三种常用方法及其适用场景。\n\n方法一：直接删除\n\n当缺失比例较低（<5%）且数据量充足时，直接删除是最简单的方案。\n\n```python\nimport pandas as pd\ndf.dropna(subset=['target_column'], inplace=True)\n```\n\n方法二：均值/中位数填充\n\n适用于数值型数据，使用均值或中位数填充缺失值，保持数据分布的基本形态。\n\n方法三：插值法\n\n对于时间序列数据，使用前后值的线性插值可以更好地保留趋势信息。\n\n> 选择缺失值处理方法时，务必结合业务场景。没有\u201c最好\u201d的方法，只有\u201c最合适\u201d的方法。\n\n总结要点\n\n- 缺失比例 < 5%：直接删除\n- 数值型数据：均值/中位数填充\n- 时间序列：插值法\n- 分类数据：众数填充或单独归类" };
})();

function loadTemplate(id) {
  var tmpl = TEMPLATES[id];
  if (!tmpl) { toast("模板未找到"); return; }
  D.editor.value = tmpl.text;
  updateCharCount();
refreshAll();

  // Font size controls
  D.fontDecBtns.forEach(function(btn) {
    btn.addEventListener("click", function() {
      var target = this.getAttribute("data-target");
      var step = 0.05;
      if (target === "title") { state.fontSizes.title = Math.max(0.9, state.fontSizes.title - step); D.titleSizeVal.textContent = state.fontSizes.title.toFixed(2); }
      else if (target === "heading") { state.fontSizes.heading = Math.max(0.7, state.fontSizes.heading - step); D.headingSizeVal.textContent = state.fontSizes.heading.toFixed(2); }
      else { state.fontSizes.body = Math.max(0.6, state.fontSizes.body - step); D.bodySizeVal.textContent = state.fontSizes.body.toFixed(2); }
      applyFontSizes(); refreshAll();
    });
  });
  D.fontIncBtns.forEach(function(btn) {
    btn.addEventListener("click", function() {
      var target = this.getAttribute("data-target");
      var step = 0.05;
      if (target === "title") { state.fontSizes.title = Math.min(2.5, state.fontSizes.title + step); D.titleSizeVal.textContent = state.fontSizes.title.toFixed(2); }
      else if (target === "heading") { state.fontSizes.heading = Math.min(2.0, state.fontSizes.heading + step); D.headingSizeVal.textContent = state.fontSizes.heading.toFixed(2); }
      else { state.fontSizes.body = Math.min(1.5, state.fontSizes.body + step); D.bodySizeVal.textContent = state.fontSizes.body.toFixed(2); }
      applyFontSizes(); refreshAll();
    });
  });

  // Init font size display
  D.titleSizeVal.textContent = state.fontSizes.title.toFixed(2);
  D.headingSizeVal.textContent = state.fontSizes.heading.toFixed(2);
  D.bodySizeVal.textContent = state.fontSizes.body.toFixed(2);
  toast("已加载：" + tmpl.name, 1500);
}
function parseText(text) {
  var lines = text.split(/\n/), blocks = [], i = 0;
  var inCode = false, codeBuf = [];
  var firstLine = -1;
  for (var j = 0; j < lines.length; j++) { if (lines[j].trim()) { firstLine = j; break; } }
  
  function isHeading(ln) {
    var t = ln.trim(); if (!t) return false;
    if (t.length <= 18 && !/[。；！？、\u2026\.\,\;\!\?]$/.test(t)) return true;
    if (/^[\u4e00-\u9fff\w\d\s]{2,16}$/.test(t) && !/[，。；！？、]/.test(t)) return true;
    if (/^[\uff08\(]?[\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341\d]+[\uff09\)、.\s]/.test(t) && t.length <= 24) return true;
    return false;
  }
  
  while (i < lines.length) {
    var raw = lines[i], ln = raw.trim();
    if (!ln) { i++; continue; }
    
    if (/^```/.test(ln)) {
      if (!inCode) { inCode = true; codeBuf = []; }
      else { inCode = false; blocks.push({ type: "code", content: codeBuf.join("\n") }); codeBuf = []; }
      i++; continue;
    }
    if (inCode) { codeBuf.push(raw); i++; continue; }
    
    if (/^[\u2500\-\u2014=*]{3,}$/.test(ln)) { blocks.push({ type: "divider" }); i++; continue; }
    
    if (/^>\s/.test(ln)) { blocks.push({ type: "quote", content: ln.replace(/^>\s*/, "") }); i++; continue; }
    
    if (/^[-*+]\s/.test(ln) || /^\d+[.\u3001)]\s/.test(ln)) {
      var items = [];
      while (i < lines.length && (/^[-*+]\s/.test(lines[i].trim()) || /^\d+[.\u3001)]\s/.test(lines[i].trim()))) {
        items.push(lines[i].trim().replace(/^[-*+\d]+[.\u3001)\s]+/, "")); i++;
      }
      blocks.push({ type: "list", items: items }); continue;
    }
    
    if (i === firstLine && ln.length <= 30 && !/[，。；！？、]$/.test(ln)) {
      blocks.push({ type: "main-title", content: ln }); i++;
      if (i < lines.length && lines[i].trim()) {
        var nl = lines[i].trim();
        if (nl.length <= 30 && /^[\u2014\u2014\-\u2013]/.test(nl)) {
          blocks.push({ type: "subtitle", content: nl.replace(/^[\u2014\u2014\-\u2013]\s*/, "") }); i++;
        }
      }
      continue;
    }
    
    if (isHeading(ln) && i !== firstLine) { blocks.push({ type: "heading", content: ln }); i++; continue; }
    
    var para = [ln]; i++;
    while (i < lines.length && lines[i].trim() && !/^```/.test(lines[i].trim()) && !/^[\u2500\-\u2014=*]{3,}$/.test(lines[i].trim()) && !/^>\s/.test(lines[i].trim()) && !/^[-*+]\s/.test(lines[i].trim()) && !/^\d+[.\u3001)]\s/.test(lines[i].trim()) && !isHeading(lines[i].trim())) {
      para.push(lines[i].trim()); i++;
    }
    blocks.push({ type: "paragraph", content: para.join("\n") });
  }
  return blocks;
}

function enhanceBlocks(blocks) {
  var result = [];
  for (var i = 0; i < blocks.length; i++) {
    var b = blocks[i];
    if (b.type === "paragraph") {
      var t = b.content.trim();
      if (t.length <= 22 && !/[，。；！？、\u2026]$/.test(t) && t.indexOf("\n") === -1) {
        var prev = i > 0 ? blocks[i - 1] : null;
        if (!prev || prev.type === "paragraph" || prev.type === "heading" || prev.type === "list") {
          result.push({ type: "heading", content: t }); continue;
        }
      }
    }
    result.push(b);
  }
  var final = [], pc = 0;
  for (var j = 0; j < result.length; j++) {
    if (result[j].type === "heading" && pc >= 3) final.push({ type: "divider" });
    if (result[j].type === "heading") pc = 0;
    if (result[j].type === "paragraph") pc++;
    final.push(result[j]);
  }
  return final;
}

function smartFormat(text) {
  return enhanceBlocks(parseText(text));
}

function escHtml(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function genWechatHtml(blocks, theme) {
  if (!blocks || !blocks.length) return "";
  
  // ===== Inline styles per theme =====
  var S = {};
  if (theme === "literary") {
    S.section = "font-family:PingFang SC,Noto Serif SC,STSong,SimSun,Microsoft YaHei,serif;color:#4A3728;background:#FFFDF9;padding:32px 24px;line-height:2;letter-spacing:0.5px;word-break:break-word;";
    S.mainTitle = "font-size:" + state.fontSizes.title + "rem;font-weight:700;color:#5D3A1A;text-align:center;margin:20px 0 8px;padding-bottom:18px;border-bottom:2px solid #C9A87C;letter-spacing:2px;line-height:1.4;";
    S.subtitle = "font-size:0.85rem;color:#B8956A;text-align:center;margin:2px 0 24px;letter-spacing:1.5px;font-weight:400;";
    S.heading = "font-size:" + state.fontSizes.heading + "rem;font-weight:700;color:#5D3A1A;margin:28px 0 14px;letter-spacing:0.5px;";
    S.paragraph = "margin:12px 0;text-indent:2em;color:#4A3728;line-height:2;font-size:" + state.fontSizes.body + "rem;";
    S.quote = "background:#FDF8F2;border-left:3px solid #C9A87C;padding:16px 20px;margin:20px 0;border-radius:0 8px 8px 0;color:#8B7355;font-style:italic;";
    S.code = "background:#2D2420;color:#E8D5C8;padding:18px 20px;border-radius:8px;font-family:SF Mono,Fira Code,Consolas,monospace;font-size:0.82rem;line-height:1.7;overflow-x:auto;white-space:pre-wrap;margin:16px 0;";
    S.list = "padding-left:1.6em;margin:12px 0;";
    S.listItem = "margin:7px 0;color:#4A3728;";
    S.divider = "text-align:center;margin:28px 0;color:#C9A87C;font-size:1rem;letter-spacing:8px;user-select:none;";
  } else if (theme === "anime") {
    S.section = "font-family:PingFang SC,Microsoft YaHei,Hiragino Sans GB,sans-serif;color:#3D3D3D;background:#FDFCFF;padding:28px 24px;line-height:2;letter-spacing:0.4px;word-break:break-word;";
    S.mainTitle = "font-size:" + state.fontSizes.title + "rem;font-weight:800;color:#5B4FCF;text-align:center;margin:18px 0 8px;padding:12px 16px;background:linear-gradient(135deg,#F0EDFF,#FDFCFF);border-radius:6px;letter-spacing:2px;line-height:1.4;";
    S.subtitle = "font-size:0.85rem;color:#A78BFA;text-align:center;margin:2px 0 22px;letter-spacing:1px;font-weight:500;";
    S.heading = "font-size:" + state.fontSizes.heading + "rem;font-weight:800;color:#5B4FCF;margin:28px 0 14px;padding:8px 14px;background:linear-gradient(90deg,#F0EDFF,transparent);border-radius:4px;letter-spacing:1px;";
    S.paragraph = "margin:12px 0;color:#4A4A4A;line-height:2;font-size:" + state.fontSizes.body + "rem;";
    S.quote = "background:#FFF5FB;border-left:4px solid #FF6B9D;padding:16px 20px;margin:20px 0;border-radius:0 12px 12px 0;color:#C44D7A;font-weight:500;";
    S.code = "background:#1E1E2E;color:#CDD6F4;padding:18px 20px;border-radius:10px;font-family:SF Mono,Fira Code,Consolas,monospace;font-size:0.82rem;line-height:1.7;overflow-x:auto;white-space:pre-wrap;margin:16px 0;border:1px solid #313244;";
    S.list = "padding-left:1.6em;margin:12px 0;";
    S.listItem = "margin:7px 0;color:#4A4A4A;";
    S.divider = "text-align:center;margin:28px 0;color:#C4B5FD;font-size:1rem;letter-spacing:8px;user-select:none;";
  } else {
    // tech
    S.section = "font-family:PingFang SC,Microsoft YaHei,-apple-system,sans-serif;color:#2C3E50;background:#FFFFFF;padding:28px 24px;line-height:1.9;letter-spacing:0.3px;word-break:break-word;";
    S.mainTitle = "font-size:" + state.fontSizes.title + "rem;font-weight:700;color:#1A1A2E;margin:20px 0 6px;padding-left:16px;border-left:5px solid #3498DB;letter-spacing:1px;line-height:1.4;";
    S.subtitle = "font-size:0.85rem;color:#64748B;margin:2px 0 24px 16px;letter-spacing:0.5px;font-weight:400;";
    S.heading = "font-size:" + state.fontSizes.heading + "rem;font-weight:700;color:#1A1A2E;margin:30px 0 14px;padding-left:14px;border-left:4px solid #3498DB;";
    S.paragraph = "margin:12px 0;color:#34495E;line-height:1.9;font-size:" + state.fontSizes.body + "rem;";
    S.quote = "background:#F0F7FB;border-left:3px solid #3498DB;padding:16px 20px;margin:20px 0;border-radius:0 6px 6px 0;color:#2980B9;font-size:0.95rem;";
    S.code = "background:#1E293B;color:#E2E8F0;padding:20px 22px;border-radius:8px;font-family:SF Mono,Fira Code,Consolas,Cascadia Code,monospace;font-size:0.82rem;line-height:1.65;overflow-x:auto;white-space:pre-wrap;margin:16px 0;";
    S.list = "padding-left:1.6em;margin:12px 0;";
    S.listItem = "margin:7px 0;color:#34495E;";
    S.divider = "text-align:center;margin:28px 0;color:#CBD5E1;font-size:0.9rem;letter-spacing:6px;user-select:none;";
  }

  var h = '<section style="' + S.section + '">';
  for (var i = 0; i < blocks.length; i++) {
    var b = blocks[i], c = escHtml(b.content || "");
    switch (b.type) {
      case "main-title": h += '<h1 style="' + S.mainTitle + '">' + c + '</h1>'; break;
      case "subtitle": h += '<p style="' + S.subtitle + '">' + c + '</p>'; break;
      case "heading": h += '<h2 style="' + S.heading + '">' + c + '</h2>'; break;
      case "paragraph": h += '<p style="' + S.paragraph + '">' + c.replace(/\n/g, '<br>') + '</p>'; break;
      case "quote": h += '<blockquote style="' + S.quote + '">' + c + '</blockquote>'; break;
      case "code": h += '<pre style="' + S.code + '"><code>' + c + '</code></pre>'; break;
      case "list":
        h += '<ul style="' + S.list + '">' + b.items.map(function(it) { return '<li style="' + S.listItem + '">' + escHtml(it) + '</li>'; }).join("") + '</ul>'; break;
      case "divider": h += '<p style="' + S.divider + '">· · ·</p>'; break;
    }
  }
  h += '</section>';
  return h;
}function renderPreview(blocks, theme) {
  if (!blocks || !blocks.length) {
    D.preview.innerHTML = '<div class="preview-placeholder"><div class="placeholder-icon">&#x1F4C4;</div><p>在左侧输入文本即可预览</p></div>';
    return;
  }
  D.preview.className = "wechat-article-preview theme-" + theme;
  var h = "";
  for (var i = 0; i < blocks.length; i++) {
    var b = blocks[i], c = escHtml(b.content || "");
    switch (b.type) {
      case "main-title": h += '<h1 class="wx-main-title">' + c + '</h1>'; break;
      case "subtitle": h += '<p class="wx-subtitle">' + c + '</p>'; break;
      case "heading": h += '<h2 class="wx-heading">' + c + '</h2>'; break;
      case "paragraph": h += '<p class="wx-paragraph">' + c.replace(/\n/g, '<br>') + '</p>'; break;
      case "quote": h += '<blockquote class="wx-quote">' + c + '</blockquote>'; break;
      case "code": h += '<pre class="wx-code-block"><code>' + c + '</code></pre>'; break;
      case "list":
        h += '<ul class="wx-list">' + b.items.map(function(it) { return '<li>' + escHtml(it) + '</li>'; }).join("") + '</ul>'; break;
      case "divider": h += '<p class="wx-divider">\u00b7 \u00b7 \u00b7</p>'; break;
    }
  }
  D.preview.innerHTML = h;
}

function refreshAll() {
  var text = D.editor.value.trim();
  if (!text) {
    state.blocks = []; state.html = "";
    renderPreview([], state.theme);
    D.sourceCode.textContent = "<!-- 请先在编辑器中输入文本 -->";
    return;
  }
  var blocks = smartFormat(text);
  state.blocks = blocks;
  state.html = genWechatHtml(blocks, state.theme);
  renderPreview(blocks, state.theme);
  D.sourceCode.textContent = state.html;
}

function aiFormat(text, callback) {
  if (!state.dsKey) { callback(null, "no_key"); return; }
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "https://api.deepseek.com/v1/chat/completions", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + state.dsKey);
  xhr.timeout = 30000;
  xhr.onload = function() {
    if (xhr.status !== 200) { callback(null, "api_error"); return; }
    try {
      var r = JSON.parse(xhr.responseText);
      var content = r.choices[0].message.content;
      var m = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || content.match(/(\{[\s\S]*\})/);
      var plan = JSON.parse(m ? m[1] : content);
      var bl = [];
      if (plan.mainTitle) bl.push({ type: "main-title", content: plan.mainTitle });
      if (plan.subtitle) bl.push({ type: "subtitle", content: plan.subtitle });
      var qm = {}, lm = {};
      if (plan.quotes) for (var q = 0; q < plan.quotes.length; q++) qm[plan.quotes[q].afterSection || 0] = plan.quotes[q];
      if (plan.listItems) for (var l = 0; l < plan.listItems.length; l++) lm[plan.listItems[l].afterSection || 0] = plan.listItems[l];
      if (plan.sections) for (var s = 0; s < plan.sections.length; s++) {
        var sec = plan.sections[s];
        if (sec.heading) bl.push({ type: "heading", content: sec.heading });
        if (sec.paragraphs) for (var p = 0; p < sec.paragraphs.length; p++) bl.push({ type: "paragraph", content: sec.paragraphs[p] });
        if (qm[s]) bl.push({ type: "quote", content: qm[s].text });
        if (lm[s] && lm[s].items) bl.push({ type: "list", items: lm[s].items });
      }
      callback(bl, "ok");
    } catch(e) { callback(null, "parse_error"); }
  };
  xhr.onerror = function() { callback(null, "network_error"); };
  xhr.ontimeout = function() { callback(null, "timeout"); };
  var prompt = "你是微信公众号排版专家。分析下面纯文本，输出JSON排版方案。\n\n规则：\n1. 提取文章主标题(mainTitle)和副标题(subtitle，可空)\n2. 将内容分为若干小节，每节含小标题(heading)和段落数组(paragraphs)\n3. 保留原文引用(quotes)和列表(listItems)\n4. 只输出JSON，不要其他内容\n\nJSON格式：\n{\n  \"mainTitle\": \"标题\",\n  \"subtitle\": \"\",\n  \"sections\": [{\"heading\": \"小节标题\", \"paragraphs\": [\"段落1\",\"段落2\"]}],\n  \"quotes\": [{\"text\": \"引用内容\", \"afterSection\": 0}],\n  \"listItems\": [{\"items\": [\"项1\",\"项2\"], \"afterSection\": 0}]\n}\n\n原文：\n" + text;
  xhr.send(JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: prompt }], temperature: 0.3, max_tokens: 4096 }));
}

function doSmartFormat() {
  var text = D.editor.value.trim();
  if (!text) { toast("请先输入文本内容"); return; }
  
  if (state.dsKey) {
    toast("AI 思考中...", 3000);
    aiFormat(text, function(blocks, status) {
      if (blocks && status === "ok") {
        state.blocks = blocks;
        state.html = genWechatHtml(blocks, state.theme);
        renderPreview(blocks, state.theme);
        D.sourceCode.textContent = state.html;
        var nt = "";
        for (var i = 0; i < blocks.length; i++) {
          var b = blocks[i]; if (i > 0) nt += "\n\n";
          switch (b.type) {
            case "main-title": nt += b.content; break;
            case "subtitle": nt += b.content; break;
            case "heading": nt += b.content; break;
            case "paragraph": nt += b.content; break;
            case "quote": nt += "> " + b.content; break;
            case "code": nt += b.content; break;
            case "list": nt += b.items.map(function(it) { return "- " + it; }).join("\n"); break;
          }
        }
        D.editor.value = nt; updateCharCount();
        toast("AI 智能排版完成", 2500);
      } else {
        toast("AI 不可用，使用规则引擎", 1500);
        doRuleFormat();
      }
    });
  } else {
    doRuleFormat();
  }
}

function doRuleFormat() {
  var text = D.editor.value.trim();
  if (!text) { toast("请先输入文本内容"); return; }
  var blocks = smartFormat(text);
  state.blocks = blocks;
  state.html = genWechatHtml(blocks, state.theme);
  renderPreview(blocks, state.theme);
  D.sourceCode.textContent = state.html;
  toast("智能排版完成", 1500);
}

function updateCharCount() {
  D.charCount.textContent = D.editor.value.length + " 字";
}

function doCopy(fromModal) {
  var h = state.html;
  if (!h) { toast("请先输入文本内容"); return; }
  try {
    var blob = new Blob([h], { type: "text/html" });
    navigator.clipboard.write([
      new ClipboardItem({ "text/html": blob, "text/plain": new Blob([h], { type: "text/plain" }) })
    ]).then(function() {
      toast("已复制！Ctrl+V 粘贴到微信公众号", 2000);
      if (fromModal) closeExportModal();
    }).catch(function() {
      navigator.clipboard.writeText(h).then(function() {
        toast("HTML 已复制（纯文本模式）", 2000);
        if (fromModal) closeExportModal();
      }).catch(function() { fallbackCopy(h, fromModal); });
    });
  } catch(e) { fallbackCopy(h, fromModal); }
}

function fallbackCopy(h, fromModal) {
  var ta = document.createElement("textarea");
  ta.value = h; ta.style.position = "fixed"; ta.style.left = "-9999px"; ta.style.top = "0";
  document.body.appendChild(ta); ta.focus(); ta.select();
  try { document.execCommand("copy"); toast("已复制！", 1500); }
  catch(e) { toast("复制失败，请手动复制", 2000); }
  document.body.removeChild(ta);
  if (fromModal) closeExportModal();
}

function openExportModal() {
  if (!state.html) { toast("请先输入文本内容"); return; }
  D.exportCode.textContent = state.html;
  D.exportModal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeExportModal() {
  D.exportModal.classList.remove("active");
  document.body.style.overflow = "";
}


// Apply font sizes to live preview (CSS custom properties)
function applyFontSizes() {
  var root = D.preview;
  root.style.setProperty("--fs-title", state.fontSizes.title + "rem");
  root.style.setProperty("--fs-heading", state.fontSizes.heading + "rem");
  root.style.setProperty("--fs-body", state.fontSizes.body + "rem");
}

function init() {
  initDom();
  initTheme();
  updateApiUi();
  
  D.editor.addEventListener("input", function() { updateCharCount(); refreshAll(); });
  D.editor.addEventListener("keydown", function(e) {
    if (e.ctrlKey && e.key === "Enter") { e.preventDefault(); doCopy(false); }
  });
  
  D.styleTabs.forEach(function(tab) {
    tab.addEventListener("click", function() {
      D.styleTabs.forEach(function(t) { t.classList.remove("active"); });
      this.classList.add("active");
      state.theme = this.getAttribute("data-theme");
      refreshAll();
      toast("已切换为" + this.textContent.trim() + "样式", 1500);
    });
  });
  
  D.previewTabs.forEach(function(tab) {
    tab.addEventListener("click", function() {
      D.previewTabs.forEach(function(t) { t.classList.remove("active"); });
      this.classList.add("active");
      var v = this.getAttribute("data-view");
      state.view = v;
      if (v === "rendered") { D.renderedView.style.display = ""; D.sourceView.style.display = "none"; }
      else { D.renderedView.style.display = "none"; D.sourceView.style.display = ""; D.sourceCode.textContent = state.html || "<!-- 无内容 -->"; }
    });
  });
  
  D.loadTemplateBtn.addEventListener("click", function() {
    var id = D.templateSelect.value;
    if (!id) { toast("请先选择一个模板"); return; }
    loadTemplate(id);
  });
  
  D.smartFormatBtn.addEventListener("click", doSmartFormat);
  D.clearBtn.addEventListener("click", function() {
    D.editor.value = ""; state.blocks = []; state.html = "";
    updateCharCount(); refreshAll(); toast("已清空", 1000);
  });
  
  D.copyBtn.addEventListener("click", function() { doCopy(false); });
  D.copyHtmlBtn.addEventListener("click", function() { doCopy(false); });
  D.previewBtn.addEventListener("click", function() {
    refreshAll();
    D.previewTabs.forEach(function(t) { t.classList.remove("active"); });
    var rt = document.querySelector('.preview-tab[data-view="rendered"]');
    if (rt) rt.classList.add("active");
    D.renderedView.style.display = ""; D.sourceView.style.display = "none";
    state.view = "rendered"; toast("预览已更新", 1000);
  });
  
  D.exportBtn.addEventListener("click", openExportModal);
  D.exportCopyBtn.addEventListener("click", function() { doCopy(true); });
  D.exportCloseBtn.addEventListener("click", closeExportModal);
  D.exportModal.addEventListener("click", function(e) { if (e.target === D.exportModal) closeExportModal(); });
  
  D.themeToggle.addEventListener("click", toggleTheme);
  
  D.settingsBtn.addEventListener("click", function() {
    var p = D.settingsPanel;
    p.style.display = (p.style.display === "none" || !p.style.display) ? "block" : "none";
  });
  
  D.apiSaveBtn.addEventListener("click", function() {
    var key = D.apiKeyInput.value.trim();
    state.dsKey = key;
    localStorage.setItem("wxp-ds-key", key);
    updateApiUi();
    toast(key ? "API Key 已保存" : "API Key 已清除", 1500);
  });
  
  refreshAll();
  // Load default template
  loadTemplate("clean"); D.templateSelect.value = "clean";
  console.log("微信草稿排版工具已就绪");
}

document.addEventListener("DOMContentLoaded", init);
})();
