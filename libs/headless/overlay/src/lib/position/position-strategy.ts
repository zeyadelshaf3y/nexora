/**
 * Pure position strategy: receives PositionContext, returns PositionResult.
 * Does not receive overlay HTMLElement or mutate DOM. Engine applies styles.
 */

import type { PositionContext } from './position-context';
import type { PositionResult } from './position-result';

export type { PositionContext } from './position-context';
export type { ArrowSide, PositionResult, Placement } from './position-result';

export interface PositionStrategy {
  apply(ctx: PositionContext): PositionResult;
  attach?(): void;
  detach?(): void;
}
