import { describe, it, expect } from 'vitest';

import type { MentionTriggerConfig } from '../types/mention-types';

import { parseMentionMatch } from './mention-parser';

describe('parseMentionMatch', () => {
  const triggerConfigs: MentionTriggerConfig<unknown>[] = [
    {
      trigger: '@',
      requireLeadingBoundary: true,
      getItems: () => [],
      displayWith: () => '',
    },
    {
      trigger: '#',
      requireLeadingBoundary: true,
      getItems: () => [],
      displayWith: () => '',
    },
  ];

  it('returns null for empty text', () => {
    expect(parseMentionMatch('', 0, triggerConfigs)).toBeNull();
  });

  it('returns match for trigger at start with boundary', () => {
    const result = parseMentionMatch('@j', 2, triggerConfigs);
    expect(result).not.toBeNull();
    if (!result) return;
    expect(result.trigger).toBe('@');
    expect(result.query).toBe('j');
    expect(result.rangeStart).toBe(0);
    expect(result.rangeEnd).toBe(2);
  });

  it('returns match for trigger after space', () => {
    const result = parseMentionMatch('hello @jo', 9, triggerConfigs);
    expect(result).not.toBeNull();
    if (!result) return;
    expect(result.trigger).toBe('@');
    expect(result.query).toBe('jo');
    expect(result.rangeStart).toBe(6);
    expect(result.rangeEnd).toBe(9);
  });

  it('returns null when trigger not at boundary (email)', () => {
    const result = parseMentionMatch('email@test.com', 14, triggerConfigs);
    expect(result).toBeNull();
  });

  it('returns match for # trigger', () => {
    const result = parseMentionMatch('see #ang', 8, triggerConfigs);
    expect(result).not.toBeNull();
    if (!result) return;
    expect(result.trigger).toBe('#');
    expect(result.query).toBe('ang');
    expect(result.rangeStart).toBe(4);
    expect(result.rangeEnd).toBe(8);
  });

  it('returns latest trigger when multiple match', () => {
    const result = parseMentionMatch('@a #b', 5, triggerConfigs);
    expect(result).not.toBeNull();
    if (!result) return;
    expect(result.trigger).toBe('#');
    expect(result.query).toBe('b');
  });

  it('when allowSpacesInQuery: true, matches multi-word queries with single spaces', () => {
    const withSpaces: MentionTriggerConfig<unknown>[] = [
      {
        trigger: '@',
        allowSpacesInQuery: true,
        requireLeadingBoundary: true,
        getItems: () => [],
        displayWith: () => '',
      },
    ];

    const r1 = parseMentionMatch('@alice h', 8, withSpaces);
    expect(r1).not.toBeNull();
    expect(r1?.query).toBe('alice h');

    const r2 = parseMentionMatch('@alice hello', 12, withSpaces);
    expect(r2).not.toBeNull();
    expect(r2?.query).toBe('alice hello');
  });

  it('when allowSpacesInQuery: true, match when only trailing space in query', () => {
    const withSpaces: MentionTriggerConfig<unknown>[] = [
      {
        trigger: '@',
        allowSpacesInQuery: true,
        requireLeadingBoundary: true,
        getItems: () => [],
        displayWith: () => '',
      },
    ];

    const result = parseMentionMatch('@alice ', 7, withSpaces);
    expect(result).not.toBeNull();
    if (!result) return;
    expect(result.query).toBe('alice ');
  });

  it('when allowSpacesInQuery: true, match with trailing space after multi-word query', () => {
    const withSpaces: MentionTriggerConfig<unknown>[] = [
      {
        trigger: '@',
        allowSpacesInQuery: true,
        requireLeadingBoundary: true,
        getItems: () => [],
        displayWith: () => '',
      },
    ];

    const r = parseMentionMatch('@alice hello ', 13, withSpaces);
    expect(r).not.toBeNull();
    expect(r?.query).toBe('alice hello ');
  });

  it('when allowSpacesInQuery: true, no match when query has consecutive spaces', () => {
    const withSpaces: MentionTriggerConfig<unknown>[] = [
      {
        trigger: '@',
        allowSpacesInQuery: true,
        requireLeadingBoundary: true,
        getItems: () => [],
        displayWith: () => '',
      },
    ];

    expect(parseMentionMatch('@alice  ', 8, withSpaces)).toBeNull();
  });

  it('when allowSpacesInQuery: true, no match when query contains a newline', () => {
    const withSpaces: MentionTriggerConfig<unknown>[] = [
      {
        trigger: '@',
        allowSpacesInQuery: true,
        requireLeadingBoundary: true,
        getItems: () => [],
        displayWith: () => '',
      },
    ];

    expect(parseMentionMatch('@alice\nhello', 12, withSpaces)).toBeNull();
  });

  it('ignores trigger inside locked mention text (no space after chip)', () => {
    const withSpaces: MentionTriggerConfig<unknown>[] = [
      {
        trigger: '@',
        allowSpacesInQuery: true,
        requireLeadingBoundary: true,
        getItems: () => [],
        displayWith: () => '',
      },
    ];

    // Without locked ranges, allowSpaces heuristic does not fire (no space in query).
    expect(parseMentionMatch('@alicehello', 11, withSpaces)).not.toBeNull();
    expect(parseMentionMatch('@alicehello', 11, withSpaces, [{ start: 0, end: 6 }])).toBeNull();
  });

  it('ignores # inside locked mention so typing after tag does not reopen', () => {
    const text = '#angularrocks';
    expect(parseMentionMatch(text, text.length, triggerConfigs)).not.toBeNull();
    expect(parseMentionMatch(text, text.length, triggerConfigs, [{ start: 0, end: 8 }])).toBeNull();
  });

  it('returns null when query exceeds maxQueryLength', () => {
    const limited: MentionTriggerConfig<unknown>[] = [
      {
        trigger: '@',
        openOnTrigger: true,
        maxQueryLength: 2,
        requireLeadingBoundary: true,
        getItems: () => [],
        displayWith: () => '',
      },
    ];

    expect(parseMentionMatch('@abc', 4, limited)).toBeNull();
    expect(parseMentionMatch('@ab', 3, limited)).not.toBeNull();
  });
});
