/** How the popover is opened: click, focus, or hover. Pass one or more; open when any of them fires. */
export type PopoverTrigger = 'click' | 'focus' | 'hover';
export type PopoverTriggerInput = PopoverTrigger | PopoverTrigger[];
