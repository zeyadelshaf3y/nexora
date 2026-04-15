import { describe, expect, it } from 'vitest';

import {
  getViewportVisibleHeightClippedByListbox,
  scrollVirtualViewportToIndex,
} from './scroll-virtual-viewport';

function mockRect(top: number, bottom: number): DOMRect {
  const h = bottom - top;
  return {
    top,
    bottom,
    left: 0,
    right: 100,
    width: 100,
    height: h,
    x: 0,
    y: top,
    toJSON() {
      return {};
    },
  };
}

describe('scrollVirtualViewportToIndex', () => {
  it('uses scrollToIndex for start alignment', () => {
    let scrolled: number | null = null;
    const viewport = {
      elementRef: { nativeElement: document.createElement('div') },
      scrollToIndex: (i: number) => {
        scrolled = i;
      },
    };
    scrollVirtualViewportToIndex(viewport, 3, 'start', 40, 100);
    expect(scrolled).toBe(3);
  });

  it('nearest scrolls when row is only partially in view (bottom clipped by listbox strip)', () => {
    const listbox = document.createElement('div');
    listbox.setAttribute('role', 'listbox');
    const el = document.createElement('div');
    listbox.appendChild(el);
    Object.defineProperty(el, 'clientHeight', { value: 200, configurable: true });
    el.scrollTop = 0;
    el.getBoundingClientRect = () => mockRect(0, 200);
    listbox.getBoundingClientRect = () => mockRect(0, 197);

    let offset: number | null = null;
    const viewport = {
      elementRef: { nativeElement: el },
      scrollToIndex: () => {
        throw new Error('expected scrollToOffset when row is not fully visible');
      },
      scrollToOffset: (o: number) => {
        offset = o;
      },
    };
    scrollVirtualViewportToIndex(viewport, 4, 'nearest', 40, 100);
    expect(offset).toBe(3);
  });

  it('nearest does not scroll when index is already in view', () => {
    const el = document.createElement('div');
    el.style.height = '200px';
    Object.defineProperty(el, 'clientHeight', { value: 200, configurable: true });
    el.scrollTop = 0;
    let scrolledToIndex: number | null = null;
    const viewport = {
      elementRef: { nativeElement: el },
      scrollToIndex: (i: number) => {
        scrolledToIndex = i;
      },
      scrollToOffset: () => {
        throw new Error('should not scroll when target visible');
      },
    };
    scrollVirtualViewportToIndex(viewport, 2, 'nearest', 40, 100);
    expect(scrolledToIndex).toBeNull();
  });

  it('nearest scrolls to index with start when target is above the viewport', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'clientHeight', { value: 200, configurable: true });
    el.scrollTop = 400;
    let scrolledToIndex: number | null = null;
    const viewport = {
      elementRef: { nativeElement: el },
      scrollToIndex: (i: number) => {
        scrolledToIndex = i;
      },
    };
    scrollVirtualViewportToIndex(viewport, 2, 'nearest', 40, 100);
    expect(scrolledToIndex).toBe(2);
  });

  it('nearest scrolls when next row starts exactly at viewport bottom (not falsely "visible")', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'clientHeight', { value: 200, configurable: true });
    el.scrollTop = 200;
    let offset: number | null = null;
    const viewport = {
      elementRef: { nativeElement: el },
      scrollToIndex: () => {
        throw new Error('expected scrollToOffset path for end alignment');
      },
      scrollToOffset: (o: number) => {
        offset = o;
      },
    };
    scrollVirtualViewportToIndex(viewport, 10, 'nearest', 40, 100);
    expect(offset).toBe(240);
  });

  it('nearest scrolls when index is in full port but outside listbox-visible strip (header/footer clip)', () => {
    const listbox = document.createElement('div');
    listbox.setAttribute('role', 'listbox');

    const el = document.createElement('div');
    listbox.appendChild(el);

    Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
    el.scrollTop = 0;

    el.getBoundingClientRect = () => mockRect(0, 400);
    listbox.getBoundingClientRect = () => mockRect(0, 200);

    let offset: number | null = null;
    const viewport = {
      elementRef: { nativeElement: el },
      scrollToIndex: () => {
        throw new Error('expected scrollToOffset when target is below visible strip');
      },
      scrollToOffset: (o: number) => {
        offset = o;
      },
    };

    scrollVirtualViewportToIndex(viewport, 5, 'nearest', 40, 100);
    expect(offset).toBe(40);
  });

  it('getViewportVisibleHeightClippedByListbox returns overlap capped by clientHeight', () => {
    const listbox = document.createElement('div');
    listbox.setAttribute('role', 'listbox');
    const el = document.createElement('div');
    listbox.appendChild(el);
    Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
    el.getBoundingClientRect = () => mockRect(0, 400);
    listbox.getBoundingClientRect = () => mockRect(0, 200);
    expect(getViewportVisibleHeightClippedByListbox(el)).toBe(200);
  });

  it('getViewportVisibleHeightClippedByListbox resolves listbox through wrapper ancestors', () => {
    const listbox = document.createElement('div');
    listbox.setAttribute('role', 'listbox');
    const wrap = document.createElement('div');
    const el = document.createElement('div');
    listbox.appendChild(wrap);
    wrap.appendChild(el);
    Object.defineProperty(el, 'clientHeight', { value: 300, configurable: true });
    el.getBoundingClientRect = () => mockRect(10, 310);
    listbox.getBoundingClientRect = () => mockRect(0, 200);
    expect(getViewportVisibleHeightClippedByListbox(el)).toBe(190);
  });

  it('getViewportVisibleHeightClippedByListbox returns clientHeight when there is no listbox ancestor', () => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'clientHeight', { value: 150, configurable: true });
    el.getBoundingClientRect = () => mockRect(0, 150);
    expect(getViewportVisibleHeightClippedByListbox(el)).toBe(150);
  });

  it('getViewportVisibleHeightClippedByListbox does not treat the viewport root as the listbox strip', () => {
    const el = document.createElement('div');
    el.setAttribute('role', 'listbox');
    document.body.appendChild(el);
    try {
      Object.defineProperty(el, 'clientHeight', { value: 120, configurable: true });
      el.getBoundingClientRect = () => mockRect(0, 60);
      expect(getViewportVisibleHeightClippedByListbox(el)).toBe(120);
    } finally {
      el.remove();
    }
  });
});
