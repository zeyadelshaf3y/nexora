import { afterEach, describe, expect, it } from 'vitest';

import { BlockScrollStrategy } from './block-scroll-strategy';

describe('BlockScrollStrategy', () => {
  const strategies: BlockScrollStrategy[] = [];

  afterEach(() => {
    for (const strategy of strategies.splice(0)) {
      strategy.detach();
    }
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.documentElement.style.overflow = '';
  });

  function createStrategy(): BlockScrollStrategy {
    const strategy = new BlockScrollStrategy();
    strategies.push(strategy);
    return strategy;
  }

  it('locks body scroll without modifying html overflow', () => {
    document.documentElement.style.overflow = 'visible';

    const strategy = createStrategy();
    strategy.attach();

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.style.overflow).toBe('visible');
  });

  it('restores body styles on detach', () => {
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '12px';

    const strategy = createStrategy();
    strategy.attach();
    strategy.detach();

    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.style.paddingRight).toBe('12px');
  });

  it('keeps scroll locked until all consumers detach', () => {
    const first = createStrategy();
    const second = createStrategy();

    first.attach();
    second.attach();

    first.detach();
    expect(document.body.style.overflow).toBe('hidden');

    second.detach();
    expect(document.body.style.overflow).toBe('');
  });
});
