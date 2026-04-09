import type { MentionChipInteractionEvent, MentionEntity } from '../types/mention-types';

export interface MentionChipInteractionDispatcherOptions {
  readonly root: HTMLElement;
  readonly mentionIdAttr: string;
  readonly mentionLabelAttr: string;
  readonly getLeaveDelayMs: () => number;
  readonly onEnter: (event: MentionChipInteractionEvent) => void;
  readonly onLeave: (event: MentionChipInteractionEvent) => void;
  readonly onChipClick: (event: MentionChipInteractionEvent) => void;
}

/**
 * Delegates chip mouse interactions from the editor root:
 * - detects mention chips via `[data-mention-id]` (or configured attr)
 * - emits enter/leave/click events with normalized payload
 * - supports an optional delayed leave (for consumer anchored overlays)
 */
export class MentionChipInteractionDispatcher {
  private readonly cleanups: Array<() => void> = [];
  private currentHoveredChip: HTMLElement | null = null;
  private leaveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly options: MentionChipInteractionDispatcherOptions) {}

  attach(): void {
    const { root, mentionIdAttr, mentionLabelAttr } = this.options;
    const chipSelector = `[${mentionIdAttr}]`;

    const buildEntity = (chip: HTMLElement): MentionEntity => ({
      id: chip.getAttribute(mentionIdAttr) ?? '',
      label: chip.getAttribute(mentionLabelAttr) ?? undefined,
      text: chip.textContent ?? '',
      start: 0,
      end: 0,
    });

    const emitEnter = (chip: HTMLElement, me: MouseEvent): void => {
      this.options.onEnter({
        element: chip,
        entity: buildEntity(chip),
        nativeEvent: me,
      });
    };

    const emitLeave = (chip: HTMLElement, me: MouseEvent): void => {
      this.options.onLeave({
        element: chip,
        entity: buildEntity(chip),
        nativeEvent: me,
      });
    };

    const emitClick = (chip: HTMLElement, me: MouseEvent): void => {
      this.options.onChipClick({
        element: chip,
        entity: buildEntity(chip),
        nativeEvent: me,
      });
    };

    const clearLeaveTimer = (): void => {
      if (this.leaveTimer != null) {
        clearTimeout(this.leaveTimer);
        this.leaveTimer = null;
      }
    };

    const finalizeLeave = (hovered: HTMLElement, nativeEvent: MouseEvent): void => {
      clearLeaveTimer();
      emitLeave(hovered, nativeEvent);
      this.currentHoveredChip = null;
    };

    const scheduleDelayedLeave = (hovered: HTMLElement, nativeEvent: MouseEvent): void => {
      clearLeaveTimer();
      const delay = Math.max(0, this.options.getLeaveDelayMs());

      if (delay === 0) {
        finalizeLeave(hovered, nativeEvent);

        return;
      }

      this.leaveTimer = setTimeout(() => {
        this.leaveTimer = null;

        if (this.currentHoveredChip !== hovered) return;

        finalizeLeave(hovered, nativeEvent);
      }, delay);
    };

    const onMouseOver = (e: Event): void => {
      const me = e as MouseEvent;

      clearLeaveTimer();

      const chip = (me.target as Element).closest(chipSelector) as HTMLElement | null;

      if (chip === this.currentHoveredChip) return;

      if (this.currentHoveredChip) {
        emitLeave(this.currentHoveredChip, me);
      }

      this.currentHoveredChip = chip;

      if (chip) {
        emitEnter(chip, me);
      }
    };

    const onMouseOut = (e: Event): void => {
      const me = e as MouseEvent;
      const related = me.relatedTarget as Element | null;
      const relatedChip = related?.closest?.(chipSelector) as HTMLElement | null;

      if (relatedChip) return;

      if (!this.currentHoveredChip) return;

      const hovered = this.currentHoveredChip;

      const leavingToPlainEditor =
        related != null && root.contains(related) && !related.closest(chipSelector);

      if (leavingToPlainEditor) {
        finalizeLeave(hovered, me);

        return;
      }

      scheduleDelayedLeave(hovered, me);
    };

    const onClick = (e: Event): void => {
      const me = e as MouseEvent;
      const chip = (me.target as Element).closest(chipSelector) as HTMLElement | null;

      if (chip) {
        emitClick(chip, me);
      }
    };

    root.addEventListener('mouseover', onMouseOver);
    root.addEventListener('mouseout', onMouseOut);
    root.addEventListener('click', onClick);

    this.cleanups.push(
      () => root.removeEventListener('mouseover', onMouseOver),
      () => root.removeEventListener('mouseout', onMouseOut),
      () => root.removeEventListener('click', onClick),
    );
  }

  dispose(): void {
    const clearLeaveTimer = (): void => {
      if (this.leaveTimer == null) return;

      clearTimeout(this.leaveTimer);
      this.leaveTimer = null;
    };

    clearLeaveTimer();

    const fns = this.cleanups;

    for (const fn of fns) {
      fn();
    }

    fns.length = 0;
    this.currentHoveredChip = null;
  }
}
