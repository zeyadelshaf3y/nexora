import { vi } from 'vitest';

const listenMock = vi.fn(() => () => {});
const scrollParentsMock = vi.fn();
const getGlobalMock = vi.fn(() => window);

vi.mock('@nexora-ui/core', () => ({
  listen: listenMock,
  scrollParents: scrollParentsMock,
  getGlobal: getGlobalMock,
}));

import { createRepositionListeners } from './reposition-listeners';

describe('createRepositionListeners', () => {
  beforeEach(() => {
    listenMock.mockClear();
    scrollParentsMock.mockReset();
    getGlobalMock.mockReturnValue(window);
  });

  it('deduplicates repeated scroll listener targets', () => {
    const host = document.createElement('div');
    const anchor = document.createElement('button');
    host.appendChild(anchor);
    scrollParentsMock.mockReturnValue([host, host]);

    createRepositionListeners({
      onReposition: vi.fn(),
      config: { anchor, host } as never,
      host,
      getAnchorElement: () => anchor,
    });

    const scrollTargets: unknown[] = [];
    for (const call of listenMock.mock.calls) {
      const args = call as unknown[];
      if (args[1] === 'scroll') scrollTargets.push(args[0]);
    }

    const uniqueTargets = new Set(scrollTargets);

    expect(uniqueTargets.size).toBe(scrollTargets.length);
  });
});
