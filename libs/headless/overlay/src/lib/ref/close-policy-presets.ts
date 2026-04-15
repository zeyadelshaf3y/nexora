import type { ClosePolicy } from './close-policy';

export type ClosePolicyPresetName = 'modal' | 'non-modal' | 'strict-modal';

export const CLOSE_POLICY_PRESET_MODAL: Readonly<ClosePolicy> = {
  escape: 'top',
  outside: 'top',
  backdrop: 'self',
};

export const CLOSE_POLICY_PRESET_NON_MODAL: Readonly<ClosePolicy> = {
  escape: 'top',
  outside: 'top',
  backdrop: 'none',
};

export const CLOSE_POLICY_PRESET_STRICT_MODAL: Readonly<ClosePolicy> = {
  escape: 'top',
  outside: 'none',
  backdrop: 'self',
  escapePropagation: 'stop',
};

export function getClosePolicyPreset(name: ClosePolicyPresetName): Readonly<ClosePolicy> {
  switch (name) {
    case 'modal':
      return CLOSE_POLICY_PRESET_MODAL;
    case 'non-modal':
      return CLOSE_POLICY_PRESET_NON_MODAL;
    case 'strict-modal':
      return CLOSE_POLICY_PRESET_STRICT_MODAL;
  }
}
