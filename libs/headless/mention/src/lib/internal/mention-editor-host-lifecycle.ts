import {
  type ComponentRef,
  type ElementRef,
  type Injector,
  type ViewContainerRef,
} from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';

import { MentionEditorHostComponent } from './mention-editor-host.component';

/**
 * Owns creation, editorReady subscription, input updates, and teardown
 * for the internal MentionEditorHostComponent instance.
 */
export class MentionEditorHostLifecycle {
  private hostRef: ComponentRef<MentionEditorHostComponent> | null = null;
  private editableRef: ElementRef<HTMLElement> | null = null;
  private editorReadySub: { unsubscribe: () => void } | null = null;

  constructor(
    private readonly viewContainerRef: ViewContainerRef,
    private readonly injector: Injector,
    private readonly onEditorReady: (ref: ElementRef<HTMLElement>) => void,
  ) {}

  ensureHost(syncInputs: () => void): void {
    if (this.hostRef) return;

    this.hostRef = this.viewContainerRef.createComponent(MentionEditorHostComponent, {
      index: 0,
      injector: this.injector,
    });

    syncInputs();

    const onEditorReady = (ref: ElementRef<HTMLElement>): void => {
      this.editableRef = ref;
      this.onEditorReady(ref);
    };

    this.editorReadySub = outputToObservable(this.hostRef.instance.editorReady)
      .pipe(take(1))
      .subscribe(onEditorReady);
  }

  hasHost(): boolean {
    return this.hostRef != null;
  }

  getEditableRef(): ElementRef<HTMLElement> | null {
    return this.editableRef;
  }

  setInput(name: string, value: unknown): void {
    this.hostRef?.setInput(name, value);
  }

  destroy(): void {
    this.editorReadySub?.unsubscribe();
    this.editorReadySub = null;
    this.editableRef = null;
    this.hostRef?.destroy();
    this.hostRef = null;
  }
}
