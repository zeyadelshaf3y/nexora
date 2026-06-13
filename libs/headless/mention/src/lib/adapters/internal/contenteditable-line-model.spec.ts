import { describe, expect, it } from 'vitest';

import {
  normalizeTextSpacesAndLineModel,
  reconcileLeadingEmptyLineArtifact,
  removeLeadingEmptyArtifactLine,
} from './contenteditable-line-model';
import { walkSelectionModel } from './contenteditable-selection';

function createEditableRoot(innerHTML: string): HTMLElement {
  const root = document.createElement('div');
  root.setAttribute('contenteditable', 'true');
  root.innerHTML = innerHTML;
  document.body.appendChild(root);

  return root;
}

describe('normalizeTextSpacesAndLineModel', () => {
  it('converts plain-text spaces to NBSP but leaves chip-internal template text untouched', () => {
    const root = document.createElement('div');
    root.setAttribute('contenteditable', 'true');

    const line = document.createElement('div');
    line.appendChild(document.createTextNode('hi '));

    const chip = document.createElement('span');
    chip.setAttribute('data-mention-id', 'u1');
    chip.setAttribute('data-mention-text', '@alice');
    chip.setAttribute('contenteditable', 'false');
    // Hydrated custom template: nested element whose text contains a regular space.
    const inner = document.createElement('span');
    inner.textContent = 'Alice Smith';
    chip.appendChild(inner);
    line.appendChild(chip);

    root.appendChild(line);
    document.body.appendChild(root);

    normalizeTextSpacesAndLineModel(root, walkSelectionModel);

    // Plain text outside the chip is normalized to NBSP for visual spacing.
    expect(line.firstChild?.nodeValue).toBe('hi\u00A0');
    // Chip-owned (Angular-rendered) text keeps its original spaces.
    expect(inner.textContent).toBe('Alice Smith');

    root.remove();
  });
});

describe('reconcileLeadingEmptyLineArtifact', () => {
  /** Linearize line-block rows into the adapter's `bodyText` form (rows joined by "\n"). */
  function readBodyText(root: HTMLElement): string {
    return Array.from(root.children)
      .map((line) => (line.textContent ?? '').replace(/\u00A0/g, ' '))
      .join('\n');
  }

  it('strips the spurious leading empty line left by undo of a clear', () => {
    const root = createEditableRoot('<div><br></div><div>hello</div>');

    const changed = reconcileLeadingEmptyLineArtifact(root, 'hello', () => readBodyText(root));

    expect(changed).toBe(true);
    expect(readBodyText(root)).toBe('hello');
    expect(root.children.length).toBe(1);
    expect(root.innerHTML).toBe('<div>hello</div>');

    root.remove();
  });

  it('removes only the extra blank line when content intentionally starts blank', () => {
    const root = createEditableRoot('<div><br></div><div><br></div><div>hello</div>');

    const changed = reconcileLeadingEmptyLineArtifact(root, '\nhello', () => readBodyText(root));

    expect(changed).toBe(true);
    expect(readBodyText(root)).toBe('\nhello');

    root.remove();
  });

  it('leaves the DOM untouched when the restored value already matches', () => {
    const root = createEditableRoot('<div>hello</div>');

    const changed = reconcileLeadingEmptyLineArtifact(root, 'hello', () => readBodyText(root));

    expect(changed).toBe(false);
    expect(root.innerHTML).toBe('<div>hello</div>');

    root.remove();
  });

  it('does not touch a legitimately blank-leading value that is not an artifact', () => {
    const root = createEditableRoot('<div><br></div><div>hello</div>');

    // The known pre-clear value genuinely started with a blank line: not an artifact.
    const changed = reconcileLeadingEmptyLineArtifact(root, '\nhello', () => readBodyText(root));

    expect(changed).toBe(false);
    expect(root.children.length).toBe(2);

    root.remove();
  });
});

describe('removeLeadingEmptyArtifactLine', () => {
  it('removes a leading empty placeholder line followed by content', () => {
    const root = createEditableRoot('<div><br></div><div>hi</div>');

    expect(removeLeadingEmptyArtifactLine(root)).toBe(true);
    expect(root.innerHTML).toBe('<div>hi</div>');

    root.remove();
  });

  it('does not remove the only line when it is empty', () => {
    const root = createEditableRoot('<div><br></div>');

    expect(removeLeadingEmptyArtifactLine(root)).toBe(false);
    expect(root.innerHTML).toBe('<div><br></div>');

    root.remove();
  });

  it('does not remove a leading line that has content', () => {
    const root = createEditableRoot('<div>first</div><div>second</div>');

    expect(removeLeadingEmptyArtifactLine(root)).toBe(false);
    expect(root.children.length).toBe(2);

    root.remove();
  });
});
