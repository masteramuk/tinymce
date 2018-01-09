/**
 * FormatControls.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';
import EditorManager from 'tinymce/core/EditorManager';
import Env from 'tinymce/core/Env';
import Control from './Control';
import FloatPanel from './FloatPanel';
import Widget from './Widget';
import Align from './editorui/Align';
import FontSelect from './editorui/FontSelect';
import FontSizeSelect from './editorui/FontSizeSelect';
import FormatSelect from './editorui/FormatSelect';
import Formats from './editorui/Formats';
import InsertButton from './editorui/InsertButton';
import SimpleControls from './editorui/SimpleControls';
import UndoRedo from './editorui/UndoRedo';
import VisualAid from './editorui/VisualAid';

var setupEnvironment = function () {
  Widget.tooltips = !Env.iOS;

  Control.translate = function (text) {
    return EditorManager.translate(text);
  };
};

var setupUiContainer = function (editor) {
  if (editor.settings.ui_container) {
    Env.container = SelectorFind.descendant(Element.fromDom(document.body), editor.settings.ui_container).fold(Fun.constant(null), function (elm) {
      return elm.dom();
    });
  }
};

var setupRtlMode = function (editor) {
  if (editor.rtl) {
    Control.rtl = true;
  }
};

var setupHideFloatPanels = function (editor) {
  editor.on('mousedown', function () {
    FloatPanel.hideAll();
  });
};

var setup = function (editor) {
  setupRtlMode(editor);
  setupHideFloatPanels(editor);
  setupUiContainer(editor);
  setupEnvironment();

  FormatSelect.register(editor);
  Align.register(editor);
  SimpleControls.register(editor);
  UndoRedo.register(editor);
  FontSizeSelect.register(editor);
  FontSelect.register(editor);
  Formats.register(editor);
  VisualAid.register(editor);
  InsertButton.register(editor);
};

export default <any> {
  setup: setup
};