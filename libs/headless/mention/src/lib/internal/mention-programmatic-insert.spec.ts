import {
  normalizeInsertMentionOptions,
  resolveProgrammaticRange,
  resolveTriggerConfig,
} from './mention-programmatic-insert';

describe('mention-programmatic-insert', () => {
  describe('normalizeInsertMentionOptions', () => {
    it('maps trigger string to options with selection default', () => {
      expect(normalizeInsertMentionOptions('@')).toEqual({ trigger: '@', at: 'selection' });
    });

    it('applies defaults for undefined and partial options', () => {
      expect(normalizeInsertMentionOptions()).toEqual({ at: 'selection' });
      expect(normalizeInsertMentionOptions({ trigger: '#', at: 'end' })).toEqual({
        trigger: '#',
        at: 'end',
      });
    });
  });

  describe('resolveTriggerConfig', () => {
    const configs = [{ trigger: '@' }, { trigger: '#' }] as const;

    it('returns explicit trigger match when provided', () => {
      const resolved = resolveTriggerConfig(configs, '#');
      expect(resolved).toBe(configs[1]);
    });

    it('returns single config when trigger omitted and list has one', () => {
      const single = [{ trigger: '@' }] as const;
      expect(resolveTriggerConfig(single)).toBe(single[0]);
    });

    it('returns undefined when trigger omitted and list has many', () => {
      expect(resolveTriggerConfig(configs)).toBeUndefined();
    });
  });

  describe('resolveProgrammaticRange', () => {
    function makeAdapter(value: string, selection?: { start: number; end: number } | null) {
      return {
        getValue: () => value,
        getSelectionRange: () => selection ?? null,
      };
    }

    it('handles start and end placements', () => {
      const adapter = makeAdapter('hello');
      expect(resolveProgrammaticRange(adapter, 'start')).toEqual({ rangeStart: 0, rangeEnd: 0 });
      expect(resolveProgrammaticRange(adapter, 'end')).toEqual({ rangeStart: 5, rangeEnd: 5 });
    });

    it('normalizes object ranges and clamps to value length', () => {
      const adapter = makeAdapter('hello');
      expect(resolveProgrammaticRange(adapter, { start: 4, end: 2 })).toEqual({
        rangeStart: 2,
        rangeEnd: 4,
      });
      expect(resolveProgrammaticRange(adapter, { start: -3, end: 20 })).toEqual({
        rangeStart: 0,
        rangeEnd: 5,
      });
    });

    it('uses selection when at=selection and falls back to end without selection', () => {
      const withSelection = makeAdapter('abcdef', { start: 5, end: 2 });
      expect(resolveProgrammaticRange(withSelection, 'selection')).toEqual({
        rangeStart: 2,
        rangeEnd: 5,
      });

      const withoutSelection = makeAdapter('abcdef', null);
      expect(resolveProgrammaticRange(withoutSelection, 'selection')).toEqual({
        rangeStart: 6,
        rangeEnd: 6,
      });
    });
  });
});
