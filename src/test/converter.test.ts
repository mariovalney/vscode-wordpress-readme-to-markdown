import * as assert from 'assert';
import { convertReadmeToMarkdown } from '../converter';

const SAMPLE_README = `=== My Awesome Plugin ===
Contributors: user1, user2
Tags: wordpress, plugin
Requires at least: 5.0
Tested up to: 6.4
Stable tag: 1.0.0
License: GPLv2 or later
Donate link: https://example.com/donate

Short description of the plugin.

== Description ==

This is the full description.

= Features =

* Feature one
* Feature two

== Screenshots ==

1. Main settings page.
2. The widget in action.

== Changelog ==

= 1.0.0 =
* Initial release.
`;

suite('Converter Test Suite', () => {
  test('converts H1 heading', () => {
    const result = convertReadmeToMarkdown('=== My Plugin ===');
    assert.strictEqual(result, '# My Plugin');
  });

  test('converts H2 heading', () => {
    const result = convertReadmeToMarkdown('== Description ==');
    assert.strictEqual(result, '## Description');
  });

  test('converts H3 heading', () => {
    const result = convertReadmeToMarkdown('= Features =');
    assert.strictEqual(result, '### Features');
  });

  test('converts metadata to bold', () => {
    const result = convertReadmeToMarkdown('Tested up to: 6.4');
    assert.ok(result.includes('**Tested up to:**'));
  });

  test('links contributors to wordpress.org profiles', () => {
    const result = convertReadmeToMarkdown('Contributors: user1, user2');
    assert.ok(result.includes('https://profiles.wordpress.org/user1/'));
    assert.ok(result.includes('https://profiles.wordpress.org/user2/'));
  });

  test('converts screenshots with plugin slug', () => {
    const input = `=== My Plugin ===\n\n== Screenshots ==\n\n1. Settings page.`;
    const result = convertReadmeToMarkdown(input);
    assert.ok(result.includes('ps.w.org/my-plugin/assets/screenshot-1.png'));
    assert.ok(result.includes('Settings page.'));
  });

  test('full readme conversion produces expected sections', () => {
    const result = convertReadmeToMarkdown(SAMPLE_README);
    assert.ok(result.includes('# My Awesome Plugin'));
    assert.ok(result.includes('## Description'));
    assert.ok(result.includes('### Features'));
    assert.ok(result.includes('## Screenshots'));
    assert.ok(result.includes('## Changelog'));
    assert.ok(result.includes('### 1.0.0'));
  });
});
