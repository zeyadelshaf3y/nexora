import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[nxrComboboxVirtualOption], ng-template[nxrSelectVirtualOption]',
  standalone: true,
})
export class BuiltinVirtualPanelOptionTemplateDirective {
  readonly templateRef = inject(TemplateRef<{ $implicit: unknown }>);
}

@Directive({
  selector: 'ng-template[nxrComboboxVirtualHeader], ng-template[nxrSelectVirtualHeader]',
  standalone: true,
})
export class BuiltinVirtualPanelHeaderTemplateDirective {
  readonly templateRef = inject(TemplateRef<void>);
}

@Directive({
  selector: 'ng-template[nxrComboboxVirtualFooter], ng-template[nxrSelectVirtualFooter]',
  standalone: true,
})
export class BuiltinVirtualPanelFooterTemplateDirective {
  readonly templateRef = inject(TemplateRef<void>);
}
