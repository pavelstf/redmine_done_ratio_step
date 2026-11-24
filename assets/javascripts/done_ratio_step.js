(function () {
  "use strict";

  function getConfig() {
    var cfg = window.DoneRatioStepConfig || {};
    var enabled = cfg.enabled !== false; // default true
    var step = parseInt(cfg.step, 10);
    if (isNaN(step) || step <= 0) step = 5;
    if (step > 25) step = 25;
    return { enabled: enabled, step: step };
  }

  function getStoredIssueDoneRatioFallback(select) {
    var v = select && select.getAttribute("data-done-ratio-current");
    if (v === null || v === undefined || v === "") {
      v = window.DoneRatioStepCurrentDoneRatio;
    }
    var n = parseInt(v, 10);
    if (!isNaN(n) && n >= 0 && n <= 100) return n;
    return null;
  }

  function uniqSortedNumeric(arr) {
    var map = Object.create(null);
    arr.forEach(function (n) {
      if (typeof n === "number" && !isNaN(n)) map[n] = true;
    });
    return Object.keys(map)
      .map(function (k) { return parseInt(k, 10); })
      .sort(function (a, b) { return a - b; });
  }

  function rebuildSelect(select, step) {
    if (!select || select.dataset.doneRatioStepApplied === "1") return;

    var hadBlank = false;
    var blankText = "";

    var currentValueRaw = (select.value !== undefined) ? select.value : "";
    var currentValue = parseInt(currentValueRaw, 10);
    var hasCurrentNumeric = !(isNaN(currentValue));

    for (var i = 0; i < select.options.length; i++) {
      var opt = select.options[i];
      if (opt.value === "") {
        hadBlank = true;
        blankText = opt.text || "";
        break;
      }
    }

    var storedFallback = getStoredIssueDoneRatioFallback(select);

    var actualCurrent = null;
    if (currentValueRaw === "") {
      actualCurrent = null;
    } else if (storedFallback !== null) {
      actualCurrent = storedFallback;
    } else if (hasCurrentNumeric) {
      actualCurrent = currentValue;
    }

    var values = [];
    for (var v = 0; v <= 100; v += step) values.push(v);

    if (actualCurrent !== null && values.indexOf(actualCurrent) === -1) {
      values.push(actualCurrent);
    }
    values = uniqSortedNumeric(values);

    var selectionToSet = (currentValueRaw === "") ? "" : String(actualCurrent !== null ? actualCurrent : currentValueRaw);

    while (select.firstChild) select.removeChild(select.firstChild);

    if (hadBlank) {
      var blank = document.createElement("option");
      blank.value = "";
      blank.textContent = blankText;
      if (selectionToSet === "") blank.selected = true;
      select.appendChild(blank);
    }

    values.forEach(function (num) {
      var o = document.createElement("option");
      o.value = String(num);
      o.textContent = String(num) + " %";
      if (String(num) === String(selectionToSet)) o.selected = true;
      select.appendChild(o);
    });

    if (selectionToSet !== "" && selectionToSet !== null && selectionToSet !== undefined) {
      select.value = String(selectionToSet);
    }

    select.dataset.doneRatioStepApplied = "1";
  }

  function findDoneRatioSelects(root) {
    root = root || document;
    var selectors = [
      "select#issue_done_ratio",
      "select[name='issue[done_ratio]']",
      "select#bulk_edit_issue_done_ratio",
      "form#issue-form select[name='issue[done_ratio]']",
      "form#bulk-edit select[name='issue[done_ratio]']"
    ];

    var results = [];
    selectors.forEach(function (sel) {
      var nodes = root.querySelectorAll(sel);
      if (nodes && nodes.length) {
        for (var i = 0; i < nodes.length; i++) results.push(nodes[i]);
      }
    });

    var uniq = [];
    var seen = new Set();
    results.forEach(function (n) {
      if (!seen.has(n)) { seen.add(n); uniq.push(n); }
    });
    return uniq;
  }

  // ---- Context menu (% Done) fix ----
  function buildStepValues(step) {
    var vals = [];
    for (var v = 0; v <= 100; v += step) vals.push(v);
    return vals;
  }

  function doneRatioAction(link) {
    var label = /^\s*(\d{1,3})\s*%\s*$/.exec(link.textContent);
    if (!label || Number(label[1]) > 100) return null;

    var href = link.getAttribute("href") || "";
    var end = href.indexOf("#");
    if (end === -1) end = href.length;
    var start = href.indexOf("?");
    if (start === -1 || start >= end) return null;

    // Redmine's action URL has one issue field. Preserve all other bytes,
    // including the return URL, when constructing a new percentage action.
    var params = href.slice(start + 1, end).split("&");
    var index = -1;
    var action;
    for (var i = 0; i < params.length; i++) {
      var param = params[i];
      var match = /^(?:issue%5Bdone_ratio%5D|issue\[done_ratio\]|done_ratio)=(\d+)$/i.exec(param);
      if (match) {
        if (index !== -1 || Number(match[1]) !== Number(label[1])) return null;
        index = i;
        action = param.slice(0, param.indexOf("=") + 1);
      } else if (/^issue(?:%5B|\[)/i.test(param)) {
        return null;
      }
    }
    if (index === -1) return null;
    return function (value) {
      var updated = params.slice();
      updated[index] = action + String(value);
      return href.slice(0, start + 1) + updated.join("&") + href.slice(end);
    };
  }

  function findContextMenuSubmenuList(menu, template) {
    var ul = template.closest("ul");
    if (!ul) return null;

    // In some Redmine selection states, done_ratio links may appear in the
    // root context-menu list. Rebuilding that list turns submenu choices into
    // top-level entries, so only touch a real nested submenu.
    if (ul.parentNode === menu) return null;
    if (!ul.parentNode || !ul.parentNode.tagName || ul.parentNode.tagName.toLowerCase() !== "li") return null;

    return ul;
  }

  function rebuildContextMenuDoneRatio(step) {
    var menu = document.getElementById("context-menu");
    if (!menu) return;

    // Inspect action parameters rather than substrings in encoded return URLs.
    var anchors = menu.querySelectorAll("a[href]");
    if (!anchors || !anchors.length) return;

    var template = null;
    var buildHref = null;
    var ul = null;
    var items = [];
    for (var i = 0; i < anchors.length; i++) {
      var action = doneRatioAction(anchors[i]);
      if (!action) continue;
      var list = findContextMenuSubmenuList(menu, anchors[i]);
      if (!list) continue;
      var entries = Array.from(list.children);
      // A real Redmine percentage submenu contains only percentage choices.
      // Selected or disabled options have a "#" link and must keep their state.
      if (!entries.every(function (li) {
        var link = li.querySelector("a");
        return link && (doneRatioAction(link) ||
          (link.getAttribute("href") === "#" && /^\s*\d{1,3}\s*%\s*$/.test(link.textContent)));
      })) continue;
      template = anchors[i];
      buildHref = action;
      ul = list;
      items = entries;
      break;
    }
    if (!template) return;

    // Avoid redoing work repeatedly for same step
    var key = "doneRatioStepContextApplied";
    if (ul.dataset[key] === String(step)) return;

    var disabled = new Map();
    items.forEach(function (li) {
      var link = li.querySelector("a");
      if (link.getAttribute("href") === "#") disabled.set(parseInt(link.textContent, 10), li);
      ul.removeChild(li);
    });
    var titleText = function (pct) { return String(pct) + " %"; };

    var values = uniqSortedNumeric(buildStepValues(step).concat(Array.from(disabled.keys())));

    values.forEach(function (pct) {
      if (disabled.has(pct)) {
        ul.appendChild(disabled.get(pct));
        return;
      }
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.textContent = titleText(pct);

      // Copy class/data attributes that Redmine uses (e.g. for ajax, data-method, etc.)
      for (var j = 0; j < template.attributes.length; j++) {
        var attr = template.attributes[j];
        if (attr && attr.name && attr.name !== "href") {
          a.setAttribute(attr.name, attr.value);
        }
      }

      a.setAttribute("href", buildHref(pct));
      li.appendChild(a);
      ul.appendChild(li);
    });

    ul.dataset[key] = String(step);
  }

  function apply() {
    var cfg = getConfig();
    if (!cfg.enabled) return;

    // Forms
    var selects = findDoneRatioSelects(document);
    selects.forEach(function (sel) {
      rebuildSelect(sel, cfg.step);
    });

    // Context menu (if already present/open)
    rebuildContextMenuDoneRatio(cfg.step);
  }

  // Initial load
  document.addEventListener("DOMContentLoaded", apply);
  document.addEventListener("turbo:load", apply);

  // Re-apply after ajax updates
  if (window.jQuery) {
    window.jQuery(document).ajaxComplete(function () {
      apply();
    });

    // Redmine context menu is opened via jquery plugin; hook into that moment too
    window.jQuery(document).on("contextmenu", function () {
      setTimeout(apply, 0);
    });
  } else {
    // Fallback: observe changes in the context menu container
    var obs = null;
    document.addEventListener("DOMContentLoaded", function () {
      var menu = document.getElementById("context-menu");
      if (!menu || typeof MutationObserver === "undefined") return;
      obs = new MutationObserver(function () {
        apply();
      });
      obs.observe(menu, { childList: true, subtree: true });
    });
  }
})();
