import {
  ATTR_MENTION_ID,
  LINE_BLOCK_TAG_DIV,
  LINE_BLOCK_TAG_P,
  LINE_BREAK_TAG,
  isLineBlockTag,
} from './contenteditable-dom-constants';

/** `<div><br></div>` (or `<p>`) as sole line child of the editing root. */
export function isEmptyLinePlaceholderBr(br: Element, editingRoot: HTMLElement): boolean {
  if (br.tagName !== LINE_BREAK_TAG) return false;

  const line = br.parentElement;

  if (!line || line.parentNode !== editingRoot) return false;
  if (!isLineBlockTag(line.tagName)) return false;

  return line.childNodes.length === 1 && line.firstChild === br;
}

export function isEmptyRootLineBlock(el: Element, editingRoot: HTMLElement): boolean {
  if (el.parentNode !== editingRoot) return false;
  if (!isLineBlockTag(el.tagName)) return false;
  if (el.childNodes.length === 0) return true;

  if (el.childNodes.length === 1 && el.firstChild instanceof HTMLBRElement) {
    return isEmptyLinePlaceholderBr(el.firstChild, editingRoot);
  }

  return false;
}

/** Ensure every child of the editing root is a line `<div>`/`<p>`. */
export function ensureRootLineModel(root: HTMLElement, doc: Document): boolean {
  const hasLineBlock = Array.from(root.childNodes).some(
    (c) => c.nodeType === Node.ELEMENT_NODE && isLineBlockTag((c as Element).tagName),
  );

  if (hasLineBlock) return false;
  const line = doc.createElement('div');

  while (root.firstChild) {
    line.appendChild(root.firstChild);
  }

  if (!line.firstChild) line.appendChild(doc.createElement('br'));

  root.appendChild(line);

  return true;
}

/** Line block that is a direct child of the editing root and contains `node`. */
export function findLineBlockContainingNode(
  node: Node,
  editingRoot: HTMLElement,
): HTMLElement | null {
  let n: Node | null = node;
  if (n.nodeType === Node.TEXT_NODE || n instanceof HTMLBRElement) {
    n = n.parentNode;
  }

  while (n && n !== editingRoot) {
    if (n.parentNode === editingRoot && n instanceof HTMLElement) {
      const tag = n.tagName;

      if (tag === LINE_BLOCK_TAG_DIV || tag === LINE_BLOCK_TAG_P) return n;
    }

    n = n.parentNode;
  }

  return null;
}

export function isRootLineBlock(node: Node | null, editingRoot: HTMLElement): node is HTMLElement {
  if (!(node instanceof HTMLElement)) return false;
  if (node.parentNode !== editingRoot) return false;

  return isLineBlockTag(node.tagName);
}

export function isPlaceholderLineBr(node: Node | null, editingRoot: HTMLElement): boolean {
  return (
    node instanceof HTMLBRElement &&
    node.parentElement != null &&
    node.parentElement.parentNode === editingRoot &&
    isEmptyLinePlaceholderBr(node, editingRoot)
  );
}

/** Inline logical length that matches adapter text accounting for placeholder `<br>`. */
function logicalInlineLength(node: Node, editingRoot: HTMLElement): number {
  if (node.nodeType === Node.TEXT_NODE)
    return (node.textContent || '').replace(/\u00A0/g, ' ').length;

  if (node.nodeType !== Node.ELEMENT_NODE) return 0;

  const el = node as Element;

  if (el.tagName === LINE_BREAK_TAG) return isEmptyLinePlaceholderBr(el, editingRoot) ? 0 : 1;
  if (el.hasAttribute(ATTR_MENTION_ID))
    return (el.textContent || '').replace(/\u00A0/g, ' ').length;

  return Array.from(el.childNodes).reduce(
    (sum, kid) => sum + logicalInlineLength(kid, editingRoot),
    0,
  );
}

/** Linear offset for a caret on a line row at boundary before `childNodes[offset]`. */
export function linearOffsetWithinLineChildBoundary(
  line: HTMLElement,
  childBoundaryIndex: number,
  editingRoot: HTMLElement,
): number {
  const kids = line.childNodes;
  const n = Math.max(0, Math.min(childBoundaryIndex, kids.length));
  let pos = 0;

  for (const kid of Array.from(kids).slice(0, n)) {
    pos += logicalInlineLength(kid, editingRoot);
  }

  return pos;
}

/** Linear offset for a caret on the editing root at boundary before `childNodes[offset]`. */
export function linearOffsetAtEditingRootBoundary(
  editingRoot: HTMLElement,
  boundaryIndex: number,
): number {
  const kids = editingRoot.childNodes;
  const n = Math.max(0, Math.min(boundaryIndex, kids.length));
  let pos = 0;
  let hasWrittenLine = false;

  for (const child of Array.from(kids).slice(0, n)) {
    const isLineBlock =
      child.nodeType === Node.ELEMENT_NODE && isLineBlockTag((child as Element).tagName);

    if (isLineBlock) {
      if (hasWrittenLine) pos += 1;

      hasWrittenLine = true;

      const nestedKids = (child as HTMLElement).childNodes;

      Array.from(nestedKids).forEach((nested) => {
        pos += logicalInlineLength(nested, editingRoot);
      });
    } else {
      pos += logicalInlineLength(child, editingRoot);
      hasWrittenLine = true;
    }
  }

  const nextRow = n < kids.length ? kids[n] : null;
  if (
    nextRow &&
    hasWrittenLine &&
    nextRow.nodeType === Node.ELEMENT_NODE &&
    isLineBlockTag((nextRow as Element).tagName)
  ) {
    pos += 1;
  }

  return pos;
}

/** Keep root line model sane on each input (cheap structural fixes). */
function normalizeEditingRootLineModel(root: HTMLElement, doc: Document): boolean {
  let changed = ensureRootLineModel(root, doc);

  for (const c of Array.from(root.childNodes)) {
    if (c.nodeType === Node.ELEMENT_NODE && (c as Element).tagName === LINE_BREAK_TAG) {
      const line = doc.createElement('div');
      line.appendChild(doc.createElement('br'));
      root.replaceChild(line, c);
      changed = true;
    }
  }

  for (const c of Array.from(root.childNodes)) {
    if (isRootLineBlock(c, root) && c.childNodes.length === 0) {
      c.appendChild(doc.createElement('br'));
      changed = true;
    }
  }

  return changed;
}

function findFirstStructuralLineBreakBr(
  line: HTMLElement,
  editingRoot: HTMLElement,
): HTMLBRElement | null {
  const lineKids = line.childNodes;

  for (const child of Array.from(lineKids)) {
    if (isStructuralLineBreak(child, editingRoot)) {
      return child;
    }
  }

  return null;
}

function isStructuralLineBreak(node: Node, editingRoot: HTMLElement): node is HTMLBRElement {
  return (
    node instanceof HTMLBRElement &&
    !isEmptyLinePlaceholderBr(node, editingRoot) &&
    node.previousSibling != null &&
    node.nextSibling != null
  );
}

/** Turn `<div>…<br>…</div>` into sibling line rows until no structural `<br>` remain. */
export function normalizeStructuralBrIntoLineRows(root: HTMLElement): boolean {
  const doc = root.ownerDocument;
  if (!doc) return false;

  let changed = true;
  let mutated = false;

  while (changed) {
    changed = false;

    for (const node of Array.from(root.childNodes)) {
      if (!isRootLineBlock(node, root)) continue;

      const line = node as HTMLElement;
      const br = findFirstStructuralLineBreakBr(line, root);

      if (!br) continue;

      changed = true;
      mutated = true;
      const newLine = doc.createElement('div');
      let n = br.nextSibling;
      br.remove();

      while (n) {
        const next = n.nextSibling;
        newLine.appendChild(n);
        n = next;
      }

      if (!newLine.firstChild) newLine.appendChild(doc.createElement('br'));
      if (!line.firstChild) line.appendChild(doc.createElement('br'));

      root.insertBefore(newLine, line.nextSibling);

      break;
    }
  }

  return mutated;
}

function hasPotentialStructuralNormalization(root: HTMLElement): boolean {
  let hasLineBlock = false;
  const rootKids = root.childNodes;

  for (const child of Array.from(rootKids)) {
    if (child.nodeType !== Node.ELEMENT_NODE) {
      continue;
    }

    const el = child as Element;
    if (el.tagName === LINE_BREAK_TAG) return true;
    if (!isLineBlockTag(el.tagName)) continue;

    hasLineBlock = true;

    if (el.childNodes.length === 0) return true;

    const nestedKids = el.childNodes;

    if (Array.from(nestedKids).some((n) => isStructuralLineBreak(n, root))) {
      return true;
    }
  }

  return !hasLineBlock;
}

export function normalizeTextSpacesAndLineModel(
  root: HTMLElement,
  mapSelectionModel: (
    root: Node,
    sel: Selection | null,
    state: { rangeStart?: number; rangeEnd?: number },
  ) => {
    anchorIdx: number | null;
    focusIdx: number | null;
    rangeStartNode: Node | null;
    rangeStartOffset: number;
    rangeEndNode: Node | null;
    rangeEndOffset: number;
  },
): void {
  const doc = root.ownerDocument;

  if (!doc) return;

  const mightMutateSpaces = (root.textContent || '').includes(' ');
  const mightMutateStructure = hasPotentialStructuralNormalization(root);

  if (!mightMutateSpaces && !mightMutateStructure) return;

  const selection = doc.getSelection();
  const hasSelection =
    !!selection && selection.rangeCount > 0 && root.contains(selection.anchorNode);

  const previousSelectionMap = hasSelection ? mapSelectionModel(root, selection, {}) : null;
  const selectionStart = previousSelectionMap?.anchorIdx ?? null;
  const selectionEnd = previousSelectionMap?.focusIdx ?? null;

  let didMutate = normalizeEditingRootLineModel(root, doc);
  didMutate = normalizeStructuralBrIntoLineRows(root) || didMutate;

  if (mightMutateSpaces) {
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();

    while (node) {
      const textNode = node as Text;
      const parent = textNode.parentElement;
      const inMention = parent != null && parent.hasAttribute(ATTR_MENTION_ID);

      if (!inMention && textNode.nodeValue?.includes(' ')) {
        textNode.nodeValue = textNode.nodeValue.replace(/ /g, '\u00A0');
        didMutate = true;
      }

      node = walker.nextNode();
    }
  }

  if (!didMutate) return;

  if (selection && selectionStart != null && selectionEnd != null) {
    const start = Math.min(selectionStart, selectionEnd);
    const end = Math.max(selectionStart, selectionEnd);
    const mappedSelection = mapSelectionModel(root, null, { rangeStart: start, rangeEnd: end });

    if (mappedSelection.rangeStartNode && mappedSelection.rangeEndNode) {
      const range = doc.createRange();
      range.setStart(mappedSelection.rangeStartNode, mappedSelection.rangeStartOffset);
      range.setEnd(mappedSelection.rangeEndNode, mappedSelection.rangeEndOffset);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}
