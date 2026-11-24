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
  getAttribute(name) { return this.attrs[name] ?? null; }
  setAttribute(name, value) { this.attrs[name] = value; }
  appendChild(child) { child.parentNode = this; this.children.push(child); return child; }
  removeChild(child) { this.children.splice(this.children.indexOf(child), 1); child.parentNode = null; }
  closest(tag) { return this.tagName.toLowerCase() === tag ? this : this.parentNode?.closest(tag); }
  querySelectorAll(selector) {
    const descendants = this.children.flatMap(child => [child, ...child.querySelectorAll('*')]);
    if (selector === '*') return descendants;
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
  statusSuffix, selectedPercent, mixedPercent = false } = {}) {
  const menu = new Element('div');
  const root = menu.appendChild(new Element('ul'));
  const status = root.appendChild(new Element('li')).appendChild(new Element('ul'));
  const suffix = backUrl ? '&back_url=' + encodeURIComponent(backUrl) : '';
  addLink(status, '/issues/bulk_update?ids%5B%5D=4803&issue%5Bstatus_id%5D=2' + (statusSuffix ?? suffix), 'In progress');
  addLink(status, '/issues/bulk_update?ids%5B%5D=4803&issue%5Bstatus_id%5D=3' + suffix, 'Closed');
  const percent = rootPercent ? root : root.appendChild(new Element('li')).appendChild(new Element('ul'));
  if (hasPercent) {
    for (const value of [0, 10, 100]) addLink(percent, `/issues/bulk_update?ids%5B%5D=4803&${key}=${value}${suffix}`, `${value} %`);
  }
  if (selectedPercent !== undefined) addLink(percent, '#', `${selectedPercent}%`).setAttribute('class', 'icon disabled');
  if (mixedPercent) addLink(percent, '/issues/4803?issue%5Bstatus_id%5D=2', 'In progress');
  const originalStatus = status.querySelectorAll('a').map(a => [a.textContent, a.getAttribute('href')]);
  const listeners = {};
  const document = {
    getElementById: id => id === 'context-menu' ? menu : null,
    querySelectorAll: () => [],
    createElement: tag => new Element(tag),
    addEventListener: (name, callback) => { (listeners[name] ||= []).push(callback); }
  };
  vm.runInNewContext(source, { document, window: { DoneRatioStepConfig: { enabled: true, step: 5 } }, setTimeout });
  const apply = () => listeners['DOMContentLoaded'][0]();
  apply();
  return { status, percent, originalStatus, apply };
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
