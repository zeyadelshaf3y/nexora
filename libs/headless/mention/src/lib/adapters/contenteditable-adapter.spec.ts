import { ElementRef, NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { createContenteditableAdapter } from './contenteditable-adapter';

describe('createContenteditableAdapter', () => {
  let root: HTMLDivElement;
  let adapter: ReturnType<typeof createContenteditableAdapter>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    root = document.createElement('div');
    root.setAttribute('contenteditable', 'true');
    document.body.appendChild(root);
    const ngZone = TestBed.inject(NgZone);
    adapter = createContenteditableAdapter(new ElementRef(root), ngZone);
  });

  it('getRectAtLinearOffset is defined and does not throw for in-range offsets', () => {
    root.appendChild(document.createTextNode('@hi'));
    expect(typeof adapter.getRectAtLinearOffset).toBe('function');
    expect(() => adapter.getRectAtLinearOffset?.(0)).not.toThrow();
    expect(() => adapter.getRectAtLinearOffset?.(99)).not.toThrow();
  });

  it('getValue() returns linearized text from text nodes and br', () => {
    const p = document.createElement('p');
    p.appendChild(document.createTextNode('Hello '));
    const br = document.createElement('br');
    p.appendChild(br);
    p.appendChild(document.createTextNode('world'));
    root.appendChild(p);
    expect(adapter.getValue()).toBe('Hello \nworld');
  });

  it('getValue() includes mention span text via data-mention-id', () => {
    const span = document.createElement('span');
    span.setAttribute('data-mention-id', '1');
    span.setAttribute('data-mention-label', 'Alice');
    span.textContent = '@alice';
    root.appendChild(document.createTextNode('Hi '));
    root.appendChild(span);
    root.appendChild(document.createTextNode('!'));
    expect(adapter.getValue()).toBe('Hi @alice!');
  });

  it('getValue() treats block siblings with newline', () => {
    const p1 = document.createElement('p');
    p1.textContent = 'Line1';
    const p2 = document.createElement('p');
    p2.textContent = 'Line2';
    root.appendChild(p1);
    root.appendChild(p2);
    expect(adapter.getValue()).toBe('Line1\nLine2');
  });

  it('replaceTextRange inserts text node when no mention metadata', () => {
    root.appendChild(document.createTextNode('ab'));
    adapter.replaceTextRange(1, 2, { replacementText: 'X', caretPlacement: 'end' });
    expect(root.textContent).toBe('aX');
  });

  it('replaceTextRange inserts mention span when mentionId is set', () => {
    root.appendChild(document.createTextNode('@a'));
    adapter.replaceTextRange(0, 2, {
      replacementText: '@alice',
      caretPlacement: 'end',
      mentionId: '1',
      mentionLabel: 'Alice',
    });
    const span = root.querySelector('span[data-mention-id="1"]');
    expect(span).not.toBeNull();
    expect(span?.getAttribute('data-mention-label')).toBe('Alice');
    expect(span?.textContent).toBe('@alice');
  });

  it('replaceTextRange at empty line placeholder does not insert inside <br>', () => {
    const line = document.createElement('div');
    line.appendChild(document.createElement('br'));
    root.appendChild(line);

    adapter.replaceTextRange(0, 0, {
      replacementText: '@alice ',
      caretPlacement: 'end',
      mentionId: 'u1',
      mentionLabel: 'Alice',
    });

    const chip = line.querySelector('span[data-mention-id="u1"]');
    expect(chip).not.toBeNull();
    expect(chip?.parentElement).toBe(line);
    expect(chip?.textContent).toBe('@alice');
    // Ensure we don't end up with malformed "<br>text</br>" content.
    expect(line.innerHTML.toLowerCase()).not.toContain('</br>');
  });

  it('replaceTextRange inserts second mention after tag + text in span, not at <p> start', () => {
    const p = document.createElement('p');
    const tag = document.createElement('span');
    tag.setAttribute('data-mention-id', 'react');
    tag.setAttribute('data-mention-label', 'react');
    tag.textContent = '#react';
    const textSpan = document.createElement('span');
    textSpan.setAttribute('data-text', 'true');
    textSpan.appendChild(document.createTextNode('asdasdas@'));
    p.appendChild(tag);
    p.appendChild(textSpan);
    root.appendChild(p);

    const value = adapter.getValue();
    const atIdx = value.lastIndexOf('@');
    expect(atIdx).toBeGreaterThan(0);
    adapter.replaceTextRange(atIdx, atIdx + 1, {
      replacementText: '@bob ',
      caretPlacement: 'end',
      mentionId: 'u1',
      mentionLabel: 'Bob',
    });

    const mentionSpans = p.querySelectorAll('span[data-mention-id]');
    expect(mentionSpans.length).toBe(2);
    expect(mentionSpans[0]?.textContent).toBe('#react');
    expect(mentionSpans[1]?.textContent).toBe('@bob');
    const flat = p.textContent ?? '';
    expect(flat.indexOf('#react')).toBeLessThan(flat.indexOf('@bob'));
    expect(flat.indexOf('asdasdas')).toBeLessThan(flat.indexOf('@bob'));
  });

  it('treats attrs-only insertion as mention span (not plain text)', () => {
    const p = document.createElement('p');
    const textSpan = document.createElement('span');
    textSpan.setAttribute('data-text', 'true');
    textSpan.appendChild(document.createTextNode('hello @'));
    p.appendChild(textSpan);
    root.appendChild(p);

    const value = adapter.getValue();
    const atIdx = value.lastIndexOf('@');
    adapter.replaceTextRange(atIdx, atIdx + 1, {
      replacementText: '@alice ',
      caretPlacement: 'end',
      mentionAttributes: { class: 'nxr-mention' },
    });

    const mentionSpans = p.querySelectorAll('span.nxr-mention');
    expect(mentionSpans.length).toBe(1);
    expect(mentionSpans[0]?.textContent).toBe('@alice');
  });

  it('inserts mention chip as contenteditable=false', () => {
    root.appendChild(document.createTextNode('@a'));
    adapter.replaceTextRange(0, 2, {
      replacementText: '@alice ',
      caretPlacement: 'end',
      mentionId: '1',
      mentionLabel: 'Alice',
      mentionAttributes: { class: 'nxr-mention' },
    });
    const span = root.querySelector('span[data-mention-id="1"]');
    expect(span?.getAttribute('contenteditable')).toBe('false');
    expect(span?.className).toContain('nxr-mention');
  });

  it('allows safe mention attributes and drops unsafe ones', () => {
    root.appendChild(document.createTextNode('@a'));
    adapter.replaceTextRange(0, 2, {
      replacementText: '@alice ',
      caretPlacement: 'end',
      mentionId: 'safe-1',
      mentionLabel: 'Alice',
      mentionAttributes: {
        class: 'chip',
        title: 'Alice',
        'data-user-id': 'u1',
        'aria-label': 'Alice mention',
        style: 'color:red',
        onclick: 'alert(1)',
        href: 'javascript:alert(1)',
      },
    });

    const span = root.querySelector('span[data-mention-id="safe-1"]');
    expect(span).not.toBeNull();
    expect(span?.getAttribute('class')).toContain('chip');
    expect(span?.getAttribute('title')).toBe('Alice');
    expect(span?.getAttribute('data-user-id')).toBe('u1');
    expect(span?.getAttribute('aria-label')).toBe('Alice mention');
    expect(span?.hasAttribute('style')).toBe(false);
    expect(span?.hasAttribute('onclick')).toBe(false);
    expect(span?.hasAttribute('href')).toBe(false);
  });

  it('insertLineBreak creates div>br and backspace removes previous mention chip', () => {
    const mention = document.createElement('span');
    mention.setAttribute('data-mention-id', '1');
    mention.setAttribute('data-mention-label', 'Alice');
    mention.setAttribute('contenteditable', 'false');
    mention.textContent = '@alice';
    root.appendChild(mention);
    root.appendChild(document.createTextNode('\u00A0x'));

    const sel = document.getSelection();
    if (!sel) throw new Error('expected selection');
    const textAfter = root.lastChild as Text;

    // Caret after NBSP, before x — backspace should delete a character first, not the chip.
    const r1 = document.createRange();
    r1.setStart(textAfter, 1);
    r1.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r1);
    expect(adapter.removeMentionBeforeCaret?.()).toBe(false);
    expect(root.querySelector('[data-mention-id="1"]')).not.toBeNull();

    // Caret at start of text after mention — whole chip removal is allowed.
    const r = document.createRange();
    r.setStart(textAfter, 0);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);
    expect(adapter.removeMentionBeforeCaret?.()).toBe(true);
    expect(root.querySelector('[data-mention-id="1"]')).toBeNull();

    const range2 = document.createRange();
    range2.setStart(root, root.childNodes.length);
    range2.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range2);
    adapter.insertLineBreak?.();
    const last = root.lastElementChild;
    expect(last?.tagName).toBe('DIV');
    expect(last?.firstElementChild?.tagName).toBe('BR');
  });

  it('insertLineBreak keeps text on first row when caret is (root, 1) after the line div', () => {
    const line = document.createElement('div');
    line.appendChild(document.createTextNode('ahmed'));
    root.appendChild(line);

    const sel = document.getSelection();
    if (!sel) throw new Error('expected selection');
    const r = document.createRange();
    r.setStart(root, 1);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);

    adapter.insertLineBreak?.();

    expect(root.children.length).toBe(2);
    const first = root.children[0];
    const second = root.children[1];
    expect(first?.textContent).toBe('ahmed');
    expect(second?.firstElementChild?.tagName).toBe('BR');
  });

  it('insertLineBreak between root inline mentions moves trailing mention to next line', () => {
    const m1 = document.createElement('span');
    m1.setAttribute('data-mention-id', 'u1');
    m1.setAttribute('data-mention-label', 'Bob');
    m1.setAttribute('contenteditable', 'false');
    m1.textContent = '@bob';

    const m2 = document.createElement('span');
    m2.setAttribute('data-mention-id', 'u2');
    m2.setAttribute('data-mention-label', 'Charlie');
    m2.setAttribute('contenteditable', 'false');
    m2.textContent = '@charlie';

    root.appendChild(m1);
    root.appendChild(m2);

    const sel = document.getSelection();
    if (!sel) throw new Error('expected selection');
    const r = document.createRange();
    r.setStart(root, 1); // boundary between @bob and @charlie (as root inline siblings)
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);

    adapter.insertLineBreak?.();

    expect(root.children.length).toBe(2);
    expect(root.children[0]?.textContent).toBe('@bob');
    expect(root.children[1]?.textContent).toBe('@charlie');
    expect(adapter.getValue()).toBe('@bob\n@charlie');
  });

  it('normalizeTextSpaces keeps caret collapsed before a mention (does not select the chip)', () => {
    const line = document.createElement('div');
    const m1 = document.createElement('span');
    m1.setAttribute('data-mention-id', '1');
    m1.setAttribute('contenteditable', 'false');
    m1.textContent = '@a';
    const m2 = document.createElement('span');
    m2.setAttribute('data-mention-id', '2');
    m2.setAttribute('contenteditable', 'false');
    m2.textContent = '@b';
    line.appendChild(m1);
    line.appendChild(m2);
    root.appendChild(line);

    const sel = document.getSelection();
    if (!sel) throw new Error('expected selection');
    const r = document.createRange();
    r.setStart(line, 1);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);

    adapter.subscribe({ input: () => {} });
    root.dispatchEvent(new Event('input', { bubbles: true }));

    expect(sel.rangeCount).toBe(1);
    const after = sel.getRangeAt(0);
    expect(after.collapsed).toBe(true);
    expect(after.toString()).toBe('');
  });

  it('removeMentionBeforeCaret between two mentions removes the left chip, not the right', () => {
    const line = document.createElement('div');
    const m1 = document.createElement('span');
    m1.setAttribute('data-mention-id', '1');
    m1.setAttribute('contenteditable', 'false');
    m1.textContent = '@a';
    const m2 = document.createElement('span');
    m2.setAttribute('data-mention-id', '2');
    m2.setAttribute('contenteditable', 'false');
    m2.textContent = '@b';
    line.appendChild(m1);
    line.appendChild(m2);
    root.appendChild(line);

    const sel = document.getSelection();
    if (!sel) throw new Error('expected selection');
    const r = document.createRange();
    r.setStart(line, 1);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);

    expect(adapter.removeMentionBeforeCaret?.()).toBe(true);
    expect(root.querySelector('[data-mention-id="1"]')).toBeNull();
    expect(root.querySelector('[data-mention-id="2"]')).not.toBeNull();
  });

  it('removeMentionBeforeCaret removes mention when caret is on line div boundary before chip', () => {
    const line = document.createElement('div');
    const mention = document.createElement('span');
    mention.setAttribute('data-mention-id', '1');
    mention.setAttribute('contenteditable', 'false');
    mention.textContent = '@bob';
    line.appendChild(mention);
    root.appendChild(line);

    const sel = document.getSelection();
    if (!sel) throw new Error('expected selection');
    const r = document.createRange();
    r.setStart(line, 0);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);

    expect(adapter.removeMentionBeforeCaret?.()).toBe(true);
    expect(root.querySelector('[data-mention-id="1"]')).toBeNull();
  });

  it('beforeinput deleteContentBackward is cancelled when mention before caret is removed', () => {
    const line = document.createElement('div');
    const mention = document.createElement('span');
    mention.setAttribute('data-mention-id', '1');
    mention.setAttribute('contenteditable', 'false');
    mention.textContent = '@bob';
    line.appendChild(mention);
    root.appendChild(line);

    const sel = document.getSelection();
    if (!sel) throw new Error('expected selection');
    const r = document.createRange();
    r.setStart(line, 0);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);

    adapter.subscribe({ input: () => {} });
    const ev = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'deleteContentBackward',
    });
    const notCancelled = root.dispatchEvent(ev);
    expect(notCancelled).toBe(false);
    expect(root.querySelector('[data-mention-id="1"]')).toBeNull();
  });

  it('maps selection at editing root boundary between line rows', () => {
    const line1 = document.createElement('div');
    line1.textContent = 'a';
    const line2 = document.createElement('div');
    line2.appendChild(document.createElement('br'));
    root.appendChild(line1);
    root.appendChild(line2);

    const sel = document.getSelection();
    if (!sel) throw new Error('expected selection');
    const r = document.createRange();
    r.setStart(root, 1);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);

    expect(adapter.getSelectionStart()).toBe(2);
    expect(adapter.getSelectionRange()).toEqual({ start: 2, end: 2 });
  });

  it('normalizes structural <br> between mentions into two line rows (input)', () => {
    const line = document.createElement('div');
    const m1 = document.createElement('span');
    m1.setAttribute('data-mention-id', '2');
    m1.setAttribute('data-mention-label', 'Bob Jones');
    m1.setAttribute('contenteditable', 'false');
    m1.className = 'nxr-mention';
    m1.textContent = '@bob';
    const m2 = document.createElement('span');
    m2.setAttribute('data-mention-id', '3');
    m2.setAttribute('data-mention-label', 'Charlie Brown');
    m2.setAttribute('contenteditable', 'false');
    m2.className = 'nxr-mention';
    m2.textContent = '@charlie';
    line.appendChild(m1);
    line.appendChild(document.createTextNode('\u00A0'));
    line.appendChild(document.createElement('br'));
    line.appendChild(m2);
    line.appendChild(document.createTextNode('\u00A0'));
    root.appendChild(line);

    adapter.subscribe({
      input: () => {},
      keydown: () => {},
    });
    root.dispatchEvent(new Event('input', { bubbles: true }));

    expect(root.children.length).toBe(2);
    expect(root.children[0]?.querySelector('[data-mention-id="2"]')).not.toBeNull();
    expect(root.children[0]?.querySelector('[data-mention-id="3"]')).toBeNull();
    expect(root.children[1]?.querySelector('[data-mention-id="3"]')).not.toBeNull();
    expect(adapter.getValue()).toContain('@bob');
    expect(adapter.getValue()).toContain('@charlie');
    expect(adapter.getValue()).toMatch(/\n/);
  });

  it('normalizes structural <br> before Arrow key handling (keydown)', () => {
    const line = document.createElement('div');
    const m1 = document.createElement('span');
    m1.setAttribute('data-mention-id', '2');
    m1.setAttribute('contenteditable', 'false');
    m1.textContent = '@bob';
    const m2 = document.createElement('span');
    m2.setAttribute('data-mention-id', '3');
    m2.setAttribute('contenteditable', 'false');
    m2.textContent = '@charlie';
    line.appendChild(m1);
    line.appendChild(document.createTextNode('\u00A0'));
    line.appendChild(document.createElement('br'));
    line.appendChild(m2);
    root.appendChild(line);

    adapter.subscribe({ keydown: () => {} });
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    expect(root.children.length).toBe(2);
    expect(root.children[1]?.querySelector('[data-mention-id="3"]')).not.toBeNull();
  });

  it('getDocument serializes bodyText and mentions with offsets', () => {
    const mention = document.createElement('span');
    mention.setAttribute('data-mention-id', 'u1');
    mention.setAttribute('data-mention-label', 'Alice Smith');
    mention.setAttribute('class', 'nxr-mention');
    mention.setAttribute('contenteditable', 'false');
    mention.textContent = '@alice';
    root.appendChild(document.createTextNode('Hi '));
    root.appendChild(mention);
    root.appendChild(document.createTextNode('\u00A0there'));
    const doc = adapter.getDocument();
    expect(doc.bodyText).toBe('Hi @alice there');
    expect(doc.mentions.length).toBe(1);
    expect(doc.mentions[0]?.id).toBe('u1');
    expect(doc.mentions[0]?.start).toBe(3);
    expect(doc.mentions[0]?.end).toBe(9);
  });

  it('setDocument hydrates DOM and remains readable via getDocument', () => {
    adapter.setDocument({
      bodyText: 'Hello @alice\nnext line',
      mentions: [
        {
          id: 'u1',
          label: 'Alice Smith',
          text: '@alice',
          start: 6,
          end: 12,
          attributes: { class: 'nxr-mention' },
        },
      ],
    });
    const chip = root.querySelector('span[data-mention-id="u1"]');
    expect(chip).not.toBeNull();
    expect(chip?.getAttribute('contenteditable')).toBe('false');
    const roundTrip = adapter.getDocument();
    expect(roundTrip.bodyText).toBe('Hello @alice\nnext line');
    expect(roundTrip.mentions.length).toBe(1);
    expect(roundTrip.mentions[0]?.text).toBe('@alice');
  });

  it('getValue/getDocument preserve consecutive spaces around mentions', () => {
    root.appendChild(document.createTextNode('hello\u00A0\u00A0'));
    const mention = document.createElement('span');
    mention.setAttribute('data-mention-id', '1');
    mention.setAttribute('data-mention-label', 'Alice');
    mention.setAttribute('contenteditable', 'false');
    mention.className = 'nxr-mention';
    mention.textContent = '@alice';
    root.appendChild(mention);
    root.appendChild(document.createTextNode('\u00A0\u00A0world\u00A0'));

    expect(adapter.getValue()).toBe('hello  @alice  world ');
    const doc = adapter.getDocument();
    expect(doc.bodyText).toBe('hello  @alice  world ');
    expect(doc.mentions.length).toBe(1);
    expect(doc.mentions[0]?.start).toBe(7);
    expect(doc.mentions[0]?.end).toBe(13);
  });

  it('does not remove mention on backspace while spaces remain after the chip', () => {
    const mention = document.createElement('span');
    mention.setAttribute('data-mention-id', '1');
    mention.setAttribute('data-mention-label', 'Alice');
    mention.setAttribute('contenteditable', 'false');
    mention.textContent = '@alice';
    root.appendChild(mention);
    root.appendChild(document.createTextNode('   '));

    const sel = document.getSelection();
    if (!sel) throw new Error('expected selection');
    const textAfter = root.lastChild as Text;
    const r = document.createRange();
    r.setStart(textAfter, 3); // end of three spaces
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);

    expect(adapter.removeMentionBeforeCaret?.()).toBe(false);
    expect(root.querySelector('[data-mention-id="1"]')).not.toBeNull();
  });

  it('backspace at start of a mention line merges with previous line and keeps caret editable', () => {
    const line1 = document.createElement('div');
    const m1 = document.createElement('span');
    m1.setAttribute('data-mention-id', 'u1');
    m1.setAttribute('data-mention-label', 'Ahmed');
    m1.setAttribute('contenteditable', 'false');
    m1.textContent = '@ahmed';
    line1.appendChild(m1);

    const line2 = document.createElement('div');
    const m2 = document.createElement('span');
    m2.setAttribute('data-mention-id', 'u2');
    m2.setAttribute('data-mention-label', 'Khaled');
    m2.setAttribute('contenteditable', 'false');
    m2.textContent = '@khaled';
    line2.appendChild(m2);

    root.appendChild(line1);
    root.appendChild(line2);

    const sel = document.getSelection();
    if (!sel) throw new Error('expected selection');
    const r = document.createRange();
    r.setStart(line2, 0);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);

    expect(adapter.removeMentionBeforeCaret?.()).toBe(true);
    expect(root.children.length).toBe(1);
    expect(adapter.getValue()).toBe('@ahmed@khaled');

    adapter.insertTextAtCaret?.(' ');
    expect(adapter.getValue()).toBe('@ahmed @khaled');
  });

  it('backspace at root boundary before a line merges lines', () => {
    const line1 = document.createElement('div');
    line1.appendChild(document.createTextNode('a'));
    const line2 = document.createElement('div');
    line2.appendChild(document.createTextNode('b'));
    root.appendChild(line1);
    root.appendChild(line2);

    const sel = document.getSelection();
    if (!sel) throw new Error('expected selection');
    const r = document.createRange();
    r.setStart(root, 1);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);

    expect(adapter.removeMentionBeforeCaret?.()).toBe(true);
    expect(root.children.length).toBe(1);
    expect(adapter.getValue()).toBe('ab');
  });

  it('treats placeholder <br> in line div as zero-width (one \\n between lines, not two)', () => {
    const l1 = document.createElement('div');
    l1.textContent = 'a';
    const l2 = document.createElement('div');
    l2.appendChild(document.createElement('br'));
    root.appendChild(l1);
    root.appendChild(l2);
    expect(adapter.getValue()).toBe('a\n');
  });

  it('maps collapsed selection in empty second line to linear offset', () => {
    const l1 = document.createElement('div');
    l1.textContent = 'a';
    const l2 = document.createElement('div');
    l2.appendChild(document.createElement('br'));
    root.appendChild(l1);
    root.appendChild(l2);

    const sel = document.getSelection();
    const r = document.createRange();
    r.setStart(l2, 0);
    r.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(r);

    expect(adapter.getSelectionStart()).toBe(2);
  });

  it('preserves newline between two mention chips on separate lines', () => {
    const line1 = document.createElement('div');
    const m1 = document.createElement('span');
    m1.setAttribute('data-mention-id', 'u3');
    m1.setAttribute('data-mention-label', 'Charlie Brown');
    m1.setAttribute('contenteditable', 'false');
    m1.textContent = '@charlie';
    line1.appendChild(m1);

    const line2 = document.createElement('div');
    const m2 = document.createElement('span');
    m2.setAttribute('data-mention-id', 't1');
    m2.setAttribute('data-mention-label', 'Angular');
    m2.setAttribute('contenteditable', 'false');
    m2.textContent = '#angular';
    line2.appendChild(m2);

    root.appendChild(line1);
    root.appendChild(line2);

    expect(adapter.getValue()).toBe('@charlie\n#angular');
    expect(adapter.getDocument().bodyText).toBe('@charlie\n#angular');
  });

  it('setDocument sanitizes invalid mention ranges and overlaps', () => {
    adapter.setDocument({
      bodyText: 'Hello @alice and @bob',
      mentions: [
        // valid
        { id: 'u1', text: '@alice', start: 6, end: 12 },
        // overlap with @alice -> should be dropped
        { id: 'bad-overlap', text: 'lice and', start: 8, end: 16 },
        // out of bounds -> clamped to valid range
        { id: 'u2', text: '@bob', start: 17, end: 999 },
        // invalid empty id -> dropped
        { id: '', text: '@x', start: 0, end: 2 },
      ],
    });

    const roundTrip = adapter.getDocument();
    expect(roundTrip.bodyText).toBe('Hello @alice and @bob');
    expect(roundTrip.mentions.length).toBe(2);
    expect(roundTrip.mentions[0]?.id).toBe('u1');
    expect(roundTrip.mentions[0]?.start).toBe(6);
    expect(roundTrip.mentions[0]?.end).toBe(12);
    expect(roundTrip.mentions[1]?.id).toBe('u2');
    expect(roundTrip.mentions[1]?.start).toBe(17);
    expect(roundTrip.mentions[1]?.end).toBe(21);
  });

  it('getSnapshot stays consistent with getValue/getDocument after edits', () => {
    adapter.setDocument({
      bodyText: 'Hi @alice',
      mentions: [{ id: 'u1', text: '@alice', start: 3, end: 9 }],
    });
    const snapshot = adapter.getSnapshot?.();
    expect(snapshot?.value).toBe(adapter.getValue());
    expect(snapshot?.document.bodyText).toBe(adapter.getDocument().bodyText);
    expect(snapshot?.document.mentions).toEqual(adapter.getDocument().mentions);
  });

  it('getSnapshot reflects latest content after replaceTextRange', () => {
    root.appendChild(document.createTextNode('@a'));
    adapter.replaceTextRange(0, 2, {
      replacementText: '@alice ',
      caretPlacement: 'end',
      mentionId: 'u1',
      mentionLabel: 'Alice',
    });
    const snapshot = adapter.getSnapshot?.();
    expect(snapshot?.value).toBe('@alice ');
    expect(snapshot?.document.bodyText).toBe('@alice ');
    expect(snapshot?.document.mentions.length).toBe(1);
    expect(snapshot?.document.mentions[0]?.id).toBe('u1');
  });

  it('handles large plain-text documents (perf regression)', () => {
    const body = 'word '.repeat(10_000).trimEnd();
    adapter.setDocument({ bodyText: body, mentions: [] });
    const doc = adapter.getDocument();
    expect(doc.bodyText.length).toBe(body.length);
    expect(doc.mentions.length).toBe(0);
  });

  it('hydrates and reads many mention chips on one line (perf regression)', () => {
    const n = 200;
    let pos = 0;
    const mentions = Array.from({ length: n }, (_, i) => {
      const t = `@u${i}`;
      const start = pos;
      pos += t.length;

      return { id: `id${i}`, text: t, start, end: pos };
    });
    const bodyText = mentions.map((m) => m.text).join('');

    adapter.setDocument({ bodyText, mentions });
    const doc = adapter.getDocument();
    expect(doc.mentions.length).toBe(n);
    expect(doc.bodyText.length).toBe(bodyText.length);
  });
});
