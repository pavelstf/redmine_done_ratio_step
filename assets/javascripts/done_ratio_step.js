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

  function replaceDoneRatioInUrl(url, value) {
    // Match only a top-level action parameter, never text inside back_url.
    var hashIndex = url.indexOf("#");
    var fragment = hashIndex === -1 ? "" : url.slice(hashIndex);
    var action = hashIndex === -1 ? url : url.slice(0, hashIndex);
    return action.replace(
      /([?&](?:issue%5Bdone_ratio%5D|issue\[done_ratio\]|done_ratio)=)\d+(?=&|$)/gi,
      function (_match, prefix) { return prefix + String(value); }
    ) + fragment;
  }

  function isDoneRatioHref(href) {
    href = href || "";
    return /[?&](?:issue%5Bdone_ratio%5D|issue\[done_ratio\]|done_ratio)=\d+(?=&|$)/i.test(href.split("#")[0]);
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

    // Use the first matching link as a template for URL structure
    var template = null;
    for (var i = 0; i < anchors.length; i++) {
      var href = anchors[i].getAttribute("href") || "";
      if (isDoneRatioHref(href)) {
        template = anchors[i];
        break;
      }
    }
    if (!template) return;

    // Identify the nested <ul> that contains the done ratio submenu items.
    var ul = findContextMenuSubmenuList(menu, template);
    if (!ul) return;

    // Avoid redoing work repeatedly for same step
    var key = "doneRatioStepContextApplied";
    if (ul.dataset[key] === String(step)) return;

    // Remove only the done_ratio items inside this UL (keep other items if any)
    var lis = Array.from(ul.children);
    lis.forEach(function (li) {
      if (!li || li.tagName.toLowerCase() !== "li") return;
      var a = li.querySelector("a");
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (isDoneRatioHref(href)) {
        li.parentNode.removeChild(li);
      }
    });

    var baseHref = template.getAttribute("href") || "#";
    var titleText = function (pct) { return String(pct) + " %"; };

    var values = buildStepValues(step);

    values.forEach(function (pct) {
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

      a.setAttribute("href", replaceDoneRatioInUrl(baseHref, pct));
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
