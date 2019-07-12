import { FieldPresence, FieldSchema, ValueSchema } from '@ephox/boulder';
import { Fun, Id, Result, Option } from '@ephox/katamari';
import { BodyComponentApi } from './BodyComponent';
import { Panel, PanelApi, panelFields } from './Panel';
import { TabApi, Tab, TabPanel, TabPanelApi, tabPanelFields } from './TabPanel';
import { NestedMenuItemContents } from '../../api/Menu';
import { BaseToolbarButtonInstanceApi } from '../toolbar/ToolbarButton';

export type ToolbarMenuButtonItemTypes = NestedMenuItemContents;
export type SuccessCallback = (menu: string | ToolbarMenuButtonItemTypes[]) => void;

export interface DialogMenuButtonInstanceApi extends BaseToolbarButtonInstanceApi {
  isDisabled: () => boolean;
  setDisabled: (state: boolean) => void;
  isActive: () => boolean;
  setActive: (state: boolean) => void;
}

// Note: This interface doesn't extend from a common button interface as this is only a configuration that specifies a button, but it's not by itself a button.
export interface DialogNormalButtonApi {
  type: 'submit' | 'cancel' | 'custom';
  name?: string;
  text: string;
  align?: 'start' | 'end';
  primary?: boolean;
  disabled?: boolean;
  icon?: string;
}

export interface DialogMenuButtonApi {
  type: 'menu';
  name?: string;
  text: string;
  align?: 'start' | 'end';
  primary?: boolean;
  disabled?: boolean;
  icon?: string;
  tooltip?: string;
  fetch?: (success: SuccessCallback) => void;
  onSetup?: (api: DialogMenuButtonInstanceApi) => (api: DialogMenuButtonInstanceApi) => void;
}

export type DialogButtonApi = DialogNormalButtonApi | DialogMenuButtonApi;

// For consistency with api/Types.ts this should perhaps be in a namespace (e.g. Types.Dialog.Panels.*)
// but there are many many references to it already / shrug
export type PanelApi = PanelApi;
export type Panel = Panel;
export type TabPanelApi = TabPanelApi;
export type TabPanel = TabPanel;
export type TabApi = TabApi;
export type Tab = Tab;

export type BodyComponentApi = BodyComponentApi;

export type DialogDataItem = any;
export type DialogData = Record<string, DialogDataItem>;

export interface DialogInstanceApi<T extends DialogData> {
  getData: () => T;
  setData: (data: Partial<T>) => void;
  disable: (name: string) => void;
  focus: (name: string) => void;
  showTab: (name: string) => void;
  redial: (nu: DialogApi<T>) => void;
  enable: (name: string) => void;
  block: (msg: string) => void;
  unblock: () => void;
  close: () => void;
}

export interface DialogActionDetails {
  name: string;
  value?: any;
}

export interface DialogChangeDetails<T> {
  name: keyof T;
}

export interface DialogTabChangeDetails {
  newTabName: string;
  oldTabName: string;
}

export type DialogActionHandler<T> = (api: DialogInstanceApi<T>, details: DialogActionDetails) => void;
export type DialogChangeHandler<T> = (api: DialogInstanceApi<T>, details: DialogChangeDetails<T>) => void;
export type DialogSubmitHandler<T> = (api: DialogInstanceApi<T>) => void;
export type DialogCloseHandler = () => void;
export type DialogCancelHandler<T> = (api: DialogInstanceApi<T>) => void;
export type DialogTabChangeHandler<T> = (api: DialogInstanceApi<T>, details: DialogTabChangeDetails) => void;

export type DialogSize = 'normal' | 'medium' | 'large';
export interface DialogApi<T extends DialogData> {
  title: string;
  size?: DialogSize;
  body: TabPanelApi | PanelApi;
  buttons: DialogButtonApi[];
  initialData?: T;

  // Gets fired when a component within the dialog has an action used by some components
  onAction?: DialogActionHandler<T>;

  // Gets fired when a value is changed while the dialog is open
  onChange?: DialogChangeHandler<T>;

  // Gets fired when the dialog form has valid data and submit/enter is pressed
  onSubmit?: DialogSubmitHandler<T>;

  // Gets fired when the dialog is closed for any reason
  onClose?: DialogCloseHandler;

  // Gets fired when the dialog is manually closed using Esc key or cancel/X button
  onCancel?: DialogCancelHandler<T>;

  // Gets fired the dialog changes tab
  onTabChange?: DialogTabChangeHandler<T>;
}

export interface DialogNormalButton {
  type: 'submit' | 'cancel' | 'custom';
  name: string;
  text: string;
  align: 'start' | 'end';
  primary: boolean;
  disabled: boolean;
  icon: Option<string>;
}

export interface DialogMenuButton {
  type: 'menu';
  name: string;
  text: string;
  align: 'start' | 'end';
  primary: boolean;
  disabled: boolean;
  icon: Option<string>;
  tooltip: Option<string>;
  fetch: (success: SuccessCallback) => void;
  onSetup: (api: BaseToolbarButtonInstanceApi) => (api: BaseToolbarButtonInstanceApi) => void;
}

export type DialogButton = DialogNormalButton | DialogMenuButton;

export interface Dialog<T> {
  title: string;
  size: DialogSize;
  body: TabPanel | Panel;
  buttons: DialogButton[];
  initialData: T;
  onAction: DialogActionHandler<T>;
  onChange: DialogChangeHandler<T>;
  onSubmit: DialogSubmitHandler<T>;
  onClose: DialogCloseHandler;
  onCancel: DialogCancelHandler<T>;
  onTabChange: DialogTabChangeHandler<T>;
}

export const dialogButtonFields = [
  FieldSchema.field(
    'name',
    'name',
    FieldPresence.defaultedThunk(() => {
      return Id.generate('button-name');
    }),
    ValueSchema.string
  ),
  FieldSchema.strictString('text'),
  FieldSchema.optionString('icon'),
  FieldSchema.defaultedStringEnum('align', 'end', ['start', 'end']),
  FieldSchema.defaultedBoolean('primary', false),
  FieldSchema.defaultedBoolean('disabled', false),
  FieldSchema.optionString('tooltip'),
  FieldSchema.defaultedFunction('fetch', Fun.noop),
  FieldSchema.defaultedFunction('onSetup', () => Fun.noop)
];

export const dialogButtonSchema = ValueSchema.objOf([
  FieldSchema.strictStringEnum('type', ['submit', 'cancel', 'custom', 'menu']),
  ...dialogButtonFields
]);

export const dialogSchema = ValueSchema.objOf([
  FieldSchema.strictString('title'),
  FieldSchema.strictOf('body', ValueSchema.choose('type', {
    panel: panelFields,
    tabpanel: tabPanelFields
  })),
  FieldSchema.defaultedString('size', 'normal'),
  FieldSchema.strictArrayOf('buttons', dialogButtonSchema),
  FieldSchema.defaulted('initialData', {}),
  FieldSchema.defaultedFunction('onAction', Fun.noop),
  FieldSchema.defaultedFunction('onChange', Fun.noop),
  FieldSchema.defaultedFunction('onSubmit', Fun.noop),
  FieldSchema.defaultedFunction('onClose', Fun.noop),
  FieldSchema.defaultedFunction('onCancel', Fun.noop),
  FieldSchema.defaulted('onTabChange', Fun.noop),
]);

export const createDialog = <T>(spec: DialogApi<T>): Result<Dialog<T>, ValueSchema.SchemaError<any>> => {
  return ValueSchema.asRaw('dialog', dialogSchema, spec);
};
