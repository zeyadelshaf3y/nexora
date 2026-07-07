import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { MentionController } from '../internal/mention-controller.types';
import { NXR_MENTION_CONTROLLER } from '../internal/mention-panel-tokens';
import type { MentionPanelState } from '../types/mention-types';

import { MentionOptionDirective } from './mention-option.directive';

@Component({
  standalone: true,
  imports: [MentionOptionDirective],
  template: `<div [nxrMentionOption]="0">Alice</div>`,
})
class TouchOptionHostComponent {}

function createMockController(
  overrides: Partial<MentionController<{ id: string }>> = {},
): MentionController<{ id: string }> {
  const panelState = signal<MentionPanelState<{ id: string }>>({
    items: [{ id: 'alice' }],
    activeIndex: 0,
    loading: false,
    session: null,
  });

  return {
    panelState,
    select: vi.fn(),
    close: vi.fn(),
    handleKeydown: vi.fn(),
    usesHoverPointerHighlight: () => true,
    setActiveIndex: vi.fn(),
    dispose: vi.fn(),
    ...overrides,
  };
}

describe('MentionOptionDirective', () => {
  it('selects the indexed item on touch pointerup', () => {
    const controller = createMockController();
    const fixture = TestBed.configureTestingModule({
      imports: [TouchOptionHostComponent],
      providers: [{ provide: NXR_MENTION_CONTROLLER, useValue: controller }],
    }).createComponent(TouchOptionHostComponent);

    fixture.detectChanges();

    const option = fixture.nativeElement.querySelector('div') as HTMLElement;

    option.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        pointerType: 'touch',
        clientX: 10,
        clientY: 10,
      }),
    );
    option.dispatchEvent(
      new PointerEvent('pointerup', {
        bubbles: true,
        pointerType: 'touch',
        clientX: 12,
        clientY: 11,
      }),
    );

    expect(controller.select).toHaveBeenCalledWith({ id: 'alice' });
  });

  it('does not select when the touch moved beyond the tap threshold', () => {
    const controller = createMockController();
    const fixture = TestBed.configureTestingModule({
      imports: [TouchOptionHostComponent],
      providers: [{ provide: NXR_MENTION_CONTROLLER, useValue: controller }],
    }).createComponent(TouchOptionHostComponent);

    fixture.detectChanges();

    const option = fixture.nativeElement.querySelector('div') as HTMLElement;

    option.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        pointerType: 'touch',
        clientX: 0,
        clientY: 0,
      }),
    );
    option.dispatchEvent(
      new PointerEvent('pointerup', {
        bubbles: true,
        pointerType: 'touch',
        clientX: 40,
        clientY: 0,
      }),
    );

    expect(controller.select).not.toHaveBeenCalled();
  });

  it('does not select on mouse pointerup', () => {
    const controller = createMockController();
    const fixture = TestBed.configureTestingModule({
      imports: [TouchOptionHostComponent],
      providers: [{ provide: NXR_MENTION_CONTROLLER, useValue: controller }],
    }).createComponent(TouchOptionHostComponent);

    fixture.detectChanges();

    const option = fixture.nativeElement.querySelector('div') as HTMLElement;

    option.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        pointerType: 'mouse',
        clientX: 10,
        clientY: 10,
      }),
    );
    option.dispatchEvent(
      new PointerEvent('pointerup', {
        bubbles: true,
        pointerType: 'mouse',
        clientX: 10,
        clientY: 10,
      }),
    );

    expect(controller.select).not.toHaveBeenCalled();
  });
});
