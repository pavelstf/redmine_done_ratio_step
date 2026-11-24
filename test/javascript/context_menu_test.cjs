const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

const source = process.env.BASELINE_REV
  ? execFileSync('git', ['show', `${process.env.BASELINE_REV}:assets/javascripts/done_ratio_step.js`], { encoding: 'utf8' })
  : fs.readFileSync(path.join(__dirname, '../../assets/javascripts/done_ratio_step.js'), 'utf8');

// Minimal DOM fixture for the selectors and mutations used by the menu code.
class Element {
  constructor(tag, attributes = {}) {
    this.tagName = tag.toUpperCase();
    this.attrs = { ...attributes };
    this.children = [];
    this.dataset = {};
    this.textContent = '';
  }
  get attributes() { return Object.entries(this.attrs).map(([name, value]) => ({ name, value })); }
  get firstChild() { return this.children[0] || null; }
  get options() { return this.children; }
  getAttribute(name) { return this.attrs[name] ?? null; }
  setAttribute(name, value) { this.attrs[name] = value; }
  appendChild(child) { child.parentNode = this; this.children.push(child); return child; }
  removeChild(child) { this.children.splice(this.children.indexOf(child), 1); child.parentNode = null; }
  cloneNode(deep) {
    const copy = new Element(this.tagName, this.attrs);
    copy.textContent = this.textContent;
    if (deep) this.children.forEach(child => copy.appendChild(child.cloneNode(true)));
    return copy;
  }
  closest(tag) { return this.tagName.toLowerCase() === tag ? this : this.parentNode?.closest(tag); }
  querySelectorAll(selector) {
    const descendants = this.children.flatMap(child => [child, ...child.querySelectorAll('*')]);
    if (selector === '*') return descendants;
    if (selector === 'template[data-done-ratio-step-current]') {
      return descendants.filter(child => child.tagName === 'TEMPLATE' && child.getAttribute('data-done-ratio-step-current') !== null);
    }
    return descendants.filter(child => child.tagName === 'A' && child.getAttribute('href') !== null &&
      (selector === 'a' || selector === 'a[href]' || child.getAttribute('href').includes('done_ratio')));
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}

function addLink(list, href, text) {
  const link = list.appendChild(new Element('li')).appendChild(new Element('a', { href, 'data-method': 'post' }));
  link.textContent = text;
  return link;
}

function runMenu({ backUrl = '', key = 'issue%5Bdone_ratio%5D', hasPercent = true, rootPercent = false,
  statusSuffix, selectedPercent, storedPercent, mixedPercent = false, step = 5, selects = [], enabled = true, canEdit = true } = {}) {
  const menu = new Element('div');
  const root = menu.appendChild(new Element('ul'));
  const status = root.appendChild(new Element('li')).appendChild(new Element('ul'));
  const suffix = backUrl ? '&back_url=' + encodeURIComponent(backUrl) : '';
  addLink(status, '/issues/bulk_update?ids%5B%5D=4803&issue%5Bstatus_id%5D=2' + (statusSuffix ?? suffix), 'In progress');
  addLink(status, '/issues/bulk_update?ids%5B%5D=4803&issue%5Bstatus_id%5D=3' + suffix, 'Closed');
  const percent = rootPercent ? root : root.appendChild(new Element('li')).appendChild(new Element('ul'));
  if (hasPercent) {
    const nativeValues = selectedPercent === undefined ? [0, 10, 100] : Array.from({ length: 11 }, (_, i) => i * 10);
    for (const value of nativeValues) {
      if (value === selectedPercent) continue;
      const href = canEdit ? `/issues/bulk_update?ids%5B%5D=4803&${key}=${value}${suffix}` : '#';
      const link = addLink(percent, href, `${value}%`);
      if (!canEdit) {
        delete link.attrs['data-method'];
        link.setAttribute('class', 'disabled');
        link.setAttribute('onclick', 'return false;');
      }
    }
  }
  let selected;
  if (selectedPercent !== undefined) {
    selected = addLink(percent, '#', `${selectedPercent}%`);
    selected.setAttribute('class', 'icon disabled');
    delete selected.attrs['data-method'];
    selected.setAttribute('onclick', 'return false;');
  }
  if (mixedPercent) addLink(percent, '/issues/4803?issue%5Bstatus_id%5D=2', 'In progress');
  if (storedPercent !== undefined) {
    const marker = root.appendChild(new Element('template', { 'data-done-ratio-step-current': 'true' }));
    const fragment = new Element('fragment');
    const link = addLink(fragment, '#', `${storedPercent}%`);
    link.setAttribute('class', 'icon disabled');
    link.setAttribute('onclick', 'return false;');
    delete link.attrs['data-method'];
    marker.content = { firstElementChild: fragment.firstChild };
  }
  const originalStatus = status.querySelectorAll('a').map(a => [a.textContent, a.getAttribute('href')]);
  const listeners = {};
  const document = {
    getElementById: id => id === 'context-menu' ? menu : null,
    querySelectorAll: () => selects,
    createElement: tag => new Element(tag),
    addEventListener: (name, callback) => { (listeners[name] ||= []).push(callback); }
  };
  vm.runInNewContext(source, { document, window: { DoneRatioStepConfig: { enabled, step } }, setTimeout });
  const apply = () => listeners['DOMContentLoaded'][0]();
  apply();
  return { status, percent, originalStatus, apply, selected };
}

for (const backUrl of ['', '/issues?f[]=tracker_id&v[tracker_id][]=1&c[]=done_ratio', '/issues?f[]=done_ratio&v[done_ratio][]=50', '/issues?issue[done_ratio]=70']) {
  test(`preserves status actions and rebuilds percentages with back_url=${backUrl}`, () => {
    const fixture = runMenu({ backUrl });
    assert.deepEqual(fixture.status.querySelectorAll('a').map(a => [a.textContent, a.getAttribute('href')]), fixture.originalStatus);
    const links = fixture.percent.querySelectorAll('a');
    assert.equal(links.length, 21);
    links.forEach((link, index) => {
      const url = new URL(link.getAttribute('href'), 'https://redmine.example');
      assert.equal(url.searchParams.get('issue[done_ratio]'), String(index * 5));
      assert.equal(url.searchParams.get('ids[]'), '4803');
      assert.equal(url.searchParams.get('back_url'), backUrl || null);
      assert.equal(link.getAttribute('data-method'), 'post');
    });
    fixture.apply();
    assert.equal(fixture.percent.querySelectorAll('a').length, 21);
  });
}

for (const key of ['issue[done_ratio]', 'issue%5bdone_ratio%5d', 'done_ratio']) {
  test(`supports direct parameter ${key}`, () => {
    assert.equal(runMenu({ key }).percent.querySelectorAll('a').length, 21);
  });
}

test('leaves status menu intact when no percent action is available', () => {
  const fixture = runMenu({ backUrl: '/issues?c[]=done_ratio', hasPercent: false });
  assert.deepEqual(fixture.status.querySelectorAll('a').map(a => [a.textContent, a.getAttribute('href')]), fixture.originalStatus);
  assert.equal(fixture.percent.querySelectorAll('a').length, 0);
});

test('retains the 1.0.4 protection for root-level percent actions', () => {
  const fixture = runMenu({ rootPercent: true, backUrl: '/issues?c[]=done_ratio' });
  assert.equal(fixture.percent.querySelectorAll('a').length, 5);
  assert.deepEqual(fixture.status.querySelectorAll('a').map(a => [a.textContent, a.getAttribute('href')]), fixture.originalStatus);
});

for (const statusSuffix of ['&back_url=/issues?done_ratio=20', '&issue%5Bdone_ratio%5D=20']) {
  test(`ignores a status URL ending in ${statusSuffix}`, () => {
    const fixture = runMenu({ statusSuffix });
    assert.deepEqual(fixture.status.querySelectorAll('a').map(a => [a.textContent, a.getAttribute('href')]), fixture.originalStatus);
    assert.equal(fixture.percent.querySelectorAll('a').length, 21);
  });
}

test('leaves mixed submenus untouched even if one item looks like a percentage action', () => {
  const fixture = runMenu({ mixedPercent: true });
  assert.deepEqual(fixture.percent.querySelectorAll('a').map(a => a.textContent), ['0%', '10%', '100%', 'In progress']);
});

test('retains a selected off-grid percentage in its disabled state', () => {
  const links = runMenu({ selectedPercent: 37 }).percent.querySelectorAll('a');
  assert.equal(links.length, 22);
  const selected = links.find(a => a.textContent === '37%');
  assert.equal(selected.getAttribute('href'), '#');
  assert.equal(selected.getAttribute('class'), 'icon disabled');
});

test('DR-01: selected 40% occurs once at its sorted position with no action', () => {
  const fixture = runMenu({ selectedPercent: 40, backUrl: '/issues?f[]=tracker_id&c[]=done_ratio' });
  const links = fixture.percent.querySelectorAll('a');
  assert.deepEqual(links.map(link => parseInt(link.textContent, 10)), Array.from({ length: 21 }, (_, i) => i * 5));
  assert.equal(links[8], fixture.selected);
  assert.equal(links[8].getAttribute('href'), '#');
  assert.equal(links[8].getAttribute('data-method'), null);
  assert.equal(links[8].getAttribute('onclick'), 'return false;');
  assert.deepEqual(links.map(link => link.textContent), Array.from({ length: 21 }, (_, i) => `${i * 5}%`));
  fixture.apply();
  assert.deepEqual(fixture.percent.querySelectorAll('a'), links);
});

test('DR-04: step 3 retains 99% and includes an actionable 100% in the menu and form', () => {
  const select = new Element('select');
  select.value = '0';
  runMenu({ step: 3, selects: [select] });
  assert.deepEqual(select.options.slice(-2).map(option => option.value), ['99', '100']);
  const links = runMenu({ step: 3 }).percent.querySelectorAll('a');
  assert.deepEqual(links.slice(-2).map(link => link.textContent), ['99%', '100%']);
  assert.equal(new URL(links.at(-1).getAttribute('href'), 'https://redmine.example').searchParams.get('issue[done_ratio]'), '100');
});

test('DR-05: fully disabled percentage submenu keeps its native choices and no actions', () => {
  const links = runMenu({ canEdit: false }).percent.querySelectorAll('a');
  assert.deepEqual(links.map(link => link.textContent), ['0%', '10%', '100%']);
  assert.ok(links.every(link => link.getAttribute('href') === '#' && link.getAttribute('data-method') === null));
});

test('DR-02: disabled plugin retains the native interval, enabled plugin applies its configured step', () => {
  const disabled = runMenu({ enabled: false, selectedPercent: 40, step: 25 }).percent.querySelectorAll('a');
  assert.deepEqual(disabled.map(link => parseInt(link.textContent, 10)).sort((a, b) => a - b),
    Array.from({ length: 11 }, (_, i) => i * 10));
  const enabled = runMenu({ selectedPercent: 40, step: 25 }).percent.querySelectorAll('a');
  assert.deepEqual(enabled.map(link => link.textContent), ['0%', '25%', '40%', '50%', '75%', '100%']);
});

for (const storedPercent of [17, 15]) {
  test(`marks saved ${storedPercent}% when Redmine omits it from the native menu`, () => {
    const fixture = runMenu({ storedPercent, backUrl: '/issues?f[]=tracker_id&c[]=done_ratio' });
    const links = fixture.percent.querySelectorAll('a');
    const values = Array.from({ length: 21 }, (_, i) => i * 5);
    if (!values.includes(storedPercent)) values.push(storedPercent);
    assert.deepEqual(links.map(link => parseInt(link.textContent, 10)), values.sort((a, b) => a - b));
    const selected = links.filter(link => link.textContent === `${storedPercent}%`);
    assert.equal(selected.length, 1);
    assert.equal(selected[0].getAttribute('href'), '#');
    assert.equal(selected[0].getAttribute('data-method'), null);
    assert.equal(selected[0].getAttribute('class'), 'icon disabled');
    assert.equal(selected[0].getAttribute('onclick'), 'return false;');
    assert.deepEqual(fixture.status.querySelectorAll('a').map(a => [a.textContent, a.getAttribute('href')]), fixture.originalStatus);
    fixture.apply();
    assert.deepEqual(fixture.percent.querySelectorAll('a'), links);
  });
}

test('keeps the native selected item when the response also provides the same saved value', () => {
  const fixture = runMenu({ selectedPercent: 40, storedPercent: 40 });
  assert.equal(fixture.percent.querySelectorAll('a')[8], fixture.selected);
  assert.equal(fixture.percent.querySelectorAll('a').length, 21);
});

test('does not inject a saved value when the percent submenu has no editable actions', () => {
  const fixture = runMenu({ storedPercent: 17, canEdit: false });
  assert.deepEqual(fixture.percent.querySelectorAll('a').map(a => a.textContent), ['0%', '10%', '100%']);
});
