import { reindexStackIndicesAfterRemoval } from '@nexora-ui/core';

import type { SnackbarOpenOptions } from '../../options/snackbar-open-options';
import type { SnackbarPlacement } from '../../position/snackbar-placement';
import { DEFAULT_SNACKBAR_STACK_GAP } from '../../position/snackbar-position-strategy';

import type { SnackbarInternalRef } from './snackbar-open-helpers';
import { SnackbarStackMetrics } from './snackbar-stack-metrics';

export interface SnackbarVisibilityChange {
  ref: SnackbarInternalRef;
  hidden: boolean;
}

/**
 * Placement stacks, group replacement, stack indices, and prefix-offset cache for snackbars.
 * Keeps {@link SnackbarService} focused on overlay open/attach and component I/O.
 */
export class SnackbarStackRegistry {
  readonly stackMetrics = new SnackbarStackMetrics<SnackbarInternalRef>();

  private readonly refsByPlacement = new Map<SnackbarPlacement, SnackbarInternalRef[]>();
  private readonly refsByGroupId = new Map<string, SnackbarInternalRef>();
  private readonly placementByRef = new Map<SnackbarInternalRef, SnackbarPlacement>();
  private readonly hiddenByRef = new Map<SnackbarInternalRef, boolean>();
  private readonly snackbarStackIndex = new Map<SnackbarInternalRef, number>();
  private readonly maxVisibleByPlacement = new Map<SnackbarPlacement, number | undefined>();
  private readonly placementVersion = new Map<SnackbarPlacement, number>();
  private readonly offsetCache = new Map<
    SnackbarPlacement,
    Map<number, { version: number; offsets: Map<SnackbarInternalRef, number> }>
  >();

  closeExistingInGroup(groupId: string | undefined): void {
    if (!groupId) return;
    const existing = this.refsByGroupId.get(groupId);
    if (existing) existing.close();
  }

  setPlacementMaxVisible(placement: SnackbarPlacement, maxVisible: number | undefined): void {
    if (maxVisible === undefined) {
      this.maxVisibleByPlacement.delete(placement);

      return;
    }
    this.maxVisibleByPlacement.set(placement, maxVisible);
  }

  getPlacementMaxVisible(placement: SnackbarPlacement): number | undefined {
    return this.maxVisibleByPlacement.get(placement);
  }

  hasRefsForPlacement(placement: SnackbarPlacement): boolean {
    return (this.refsByPlacement.get(placement)?.length ?? 0) > 0;
  }

  registerRef(placement: SnackbarPlacement, ref: SnackbarInternalRef): SnackbarVisibilityChange[] {
    const list = this.refsByPlacement.get(placement) ?? [];
    list.push(ref);
    this.refsByPlacement.set(placement, list);
    this.snackbarStackIndex.set(ref, list.length - 1);
    this.placementByRef.set(ref, placement);

    return this.recomputePlacementVisibility(placement);
  }

  unregisterRef(
    placement: SnackbarPlacement,
    ref: SnackbarInternalRef,
  ): SnackbarVisibilityChange[] {
    const list = this.refsByPlacement.get(placement) ?? [];
    let i = this.snackbarStackIndex.get(ref);

    if (i === undefined) {
      i = list.indexOf(ref);
    }

    if (i !== -1) {
      list.splice(i, 1);
      this.snackbarStackIndex.delete(ref);

      reindexStackIndicesAfterRemoval(list, this.snackbarStackIndex, i);
    }

    this.stackMetrics.untrackPane(ref);
    this.placementByRef.delete(ref);
    this.hiddenByRef.delete(ref);

    if (list.length === 0) {
      this.refsByPlacement.delete(placement);
      this.maxVisibleByPlacement.delete(placement);
      this.bumpPlacementVersion(placement);

      return [];
    }

    return this.recomputePlacementVisibility(placement);
  }

  registerRefByGroupId(groupId: string, ref: SnackbarInternalRef): void {
    this.refsByGroupId.set(groupId, ref);
  }

  unregisterRefByGroupId(groupId: string, ref: SnackbarInternalRef): void {
    if (this.refsByGroupId.get(groupId) === ref) this.refsByGroupId.delete(groupId);
  }

  repositionPlacementStack(placement: SnackbarPlacement): void {
    this.bumpPlacementVersion(placement);
    const remaining = this.refsByPlacement.get(placement) ?? [];

    for (const r of remaining) {
      if (this.isRefHidden(r)) continue;
      r.reposition();
    }
  }

  isRefHidden(ref: SnackbarInternalRef): boolean {
    return this.hiddenByRef.get(ref) === true;
  }

  getStackOffsetForRef(
    placement: SnackbarPlacement,
    currentRef: SnackbarInternalRef | null,
    options: SnackbarOpenOptions,
  ): number {
    const stackGap = options.stackGap ?? DEFAULT_SNACKBAR_STACK_GAP;
    if (currentRef == null) return 0;

    return this.getOffsetFromCache(placement, currentRef, stackGap);
  }

  private bumpPlacementVersion(placement: SnackbarPlacement): void {
    const next = (this.placementVersion.get(placement) ?? 0) + 1;
    this.placementVersion.set(placement, next);
  }

  private getOffsetFromCache(
    placement: SnackbarPlacement,
    ref: SnackbarInternalRef,
    stackGap: number,
  ): number {
    const currentVersion = this.placementVersion.get(placement) ?? 0;
    const byGap = this.offsetCache.get(placement) ?? new Map();
    this.offsetCache.set(placement, byGap);
    const cached = byGap.get(stackGap);
    if (!cached || cached.version !== currentVersion) {
      const offsets = this.buildOffsets(placement, stackGap);
      byGap.set(stackGap, { version: currentVersion, offsets });

      return offsets.get(ref) ?? 0;
    }

    return cached.offsets.get(ref) ?? 0;
  }

  private buildOffsets(
    placement: SnackbarPlacement,
    stackGap: number,
  ): Map<SnackbarInternalRef, number> {
    const offsets = new Map<SnackbarInternalRef, number>();
    const list = this.refsByPlacement.get(placement) ?? [];
    let running = 0;

    for (const r of list) {
      if (this.isRefHidden(r)) continue;
      offsets.set(r, running);
      const measured = this.stackMetrics.getHeight(r) ?? r.getPaneElement()?.offsetHeight ?? 0;
      running += measured + stackGap;
    }

    return offsets;
  }

  private recomputePlacementVisibility(placement: SnackbarPlacement): SnackbarVisibilityChange[] {
    const list = this.refsByPlacement.get(placement) ?? [];
    const maxVisible = this.maxVisibleByPlacement.get(placement);
    const visibleCount =
      maxVisible == null ? Number.POSITIVE_INFINITY : Math.max(0, Math.floor(maxVisible));
    const hideCount =
      visibleCount === Number.POSITIVE_INFINITY ? 0 : Math.max(0, list.length - visibleCount);
    const changes: SnackbarVisibilityChange[] = [];

    for (let i = 0; i < list.length; i++) {
      const ref = list[i];
      const nextHidden = i < hideCount;
      const prevHidden = this.hiddenByRef.get(ref) === true;

      if (prevHidden !== nextHidden) {
        this.hiddenByRef.set(ref, nextHidden);
        changes.push({ ref, hidden: nextHidden });
      } else if (!this.hiddenByRef.has(ref)) {
        this.hiddenByRef.set(ref, nextHidden);
      }
    }

    this.bumpPlacementVersion(placement);

    return changes;
  }
}
