/**
 * Internal host: contenteditable surface.
 * Only structural/functional styles — user provides all visual styling via
 * `nxrMentionEditorClass` (forwarded here as `editorExtraClass`).
 */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  ViewChild,
  ViewEncapsulation,
  type AfterViewInit,
  type ElementRef,
} from '@angular/core';

import {
  NXR_MENTION_DEFAULT_ARIA_LABEL,
  NXR_MENTION_DISABLED_CLASS,
  NXR_MENTION_EDITOR_CLASS,
  NXR_MENTION_EDITOR_WRAPPER_CLASS,
} from '../constants/mention-constants';

@Component({
  selector: 'nxr-mention-editor-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div [class]="wrapperClass">
      <div
        #editorRef
        [class]="computedEditorClass()"
        [attr.contenteditable]="isDisabled() ? 'false' : 'true'"
        role="textbox"
        spellcheck="true"
        [tabindex]="isDisabled() ? -1 : 0"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-expanded]="panelOpen() ? 'true' : 'false'"
        [attr.aria-autocomplete]="panelOpen() ? 'list' : null"
        aria-haspopup="listbox"
        [attr.aria-controls]="ariaControlsPanelId() || null"
        [attr.aria-activedescendant]="ariaActiveDescendantId() || null"
        [attr.aria-disabled]="isDisabled() ? 'true' : null"
        [attr.data-empty]="isContentEmpty() ? '' : null"
        [attr.data-disabled]="isDisabled() ? '' : null"
      >
        <div><br /></div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-width: 0;
      }
      .nxr-mention-editor-wrapper {
        position: relative;
        display: block;
        width: 100%;
        min-width: 0;
      }
      .nxr-mention-editor {
        position: relative;
        display: block;
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
        margin: 0;
        outline: none;
        white-space: pre-wrap;
        word-break: break-word;
        overflow-wrap: break-word;
        touch-action: manipulation;
        -webkit-user-select: text;
        user-select: text;
        cursor: text;
        font-family: inherit;
      }
      .nxr-mention-editor.nxr-mention-editor--disabled {
        cursor: default;
        -webkit-user-select: none;
        user-select: none;
      }
      .nxr-mention-editor [data-mention-id] {
        display: inline-block;
        vertical-align: baseline;
      }
    `,
  ],
})
export class MentionEditorHostComponent implements AfterViewInit {
  readonly wrapperClass = NXR_MENTION_EDITOR_WRAPPER_CLASS;

  readonly ariaLabel = input<string>(NXR_MENTION_DEFAULT_ARIA_LABEL);
  readonly contentValue = input<string>('');
  readonly panelOpen = input<boolean>(false);
  readonly ariaControlsPanelId = input<string | undefined>(undefined);
  readonly ariaActiveDescendantId = input<string | undefined>(undefined);
  readonly editorExtraClass = input<string>('');
  readonly disabled = input<boolean>(false);

  protected readonly isDisabled = computed(() => this.disabled());
  protected readonly isContentEmpty = computed(() => this.contentValue().trim().length === 0);

  protected readonly computedEditorClass = computed(() => {
    const classNames = [NXR_MENTION_EDITOR_CLASS];

    if (this.isDisabled()) classNames.push(NXR_MENTION_DISABLED_CLASS);

    const extraClassName = this.editorExtraClass();
    if (extraClassName) classNames.push(extraClassName);

    return classNames.join(' ');
  });

  @ViewChild('editorRef') readonly editorRef!: ElementRef<HTMLElement>;

  readonly editorReady = output<ElementRef<HTMLElement>>();

  ngAfterViewInit(): void {
    this.editorReady.emit(this.editorRef);
  }
}
