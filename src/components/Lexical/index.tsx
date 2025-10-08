/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { CAN_USE_DOM } from "@lexical/utils";
import { Empty, theme } from "antd";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  type EditorState,
} from "lexical";
import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import "./index.css";
import EditorNodes from "./nodes/EditorNodes";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import DraggableBlockPlugin from "./plugins/DraggableBlockPlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import FloatingTextFormatToolbarPlugin from "./plugins/FloatingTextFormatToolbarPlugin";
import LexicalAutoLinkPlugin from "./plugins/LexicalAutoLinkPlugin";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import { MaxLengthPlugin } from "./plugins/MaxLengthPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import EditorTheme from "./themes/EditorTheme";

type EditorProps = {
  placeholder?: string;
  maxLength?: number;
  editable?: boolean;
  value?: string;
  emptyDescription?: string;
  onChange?: (value: string) => void;
};

function Editor({
  placeholder = "",
  maxLength,
  editable = true,
  onChange,
  value,
}: EditorProps): React.JSX.Element {
  const { token } = theme.useToken();
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] =
    useState<boolean>(false);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const updateViewPortWidth = useCallback(() => {
    const isNextSmallWidthViewport =
      CAN_USE_DOM && window.matchMedia("(max-width: 1025px)").matches;
    if (isNextSmallWidthViewport !== isSmallWidthViewport) {
      setIsSmallWidthViewport(isNextSmallWidthViewport);
    }
  }, [isSmallWidthViewport]);

  useEffect(() => {
    updateViewPortWidth();
    window.addEventListener("resize", updateViewPortWidth);
    return () => window.removeEventListener("resize", updateViewPortWidth);
  }, [updateViewPortWidth]);

  useEffect(() => {
    editor.setEditable(!!editable);
  }, [editable, editor]);

  const onRef = useCallback((_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  }, []);

  const containerStyle: CSSProperties = useMemo(
    () => ({
      borderRadius: token.borderRadius,
      borderColor: token.colorBorder,
      borderStyle: editable ? "solid" : "none",
      borderWidth: editable ? 1 : 0,
    }),
    [token, editable]
  );

  const renderContentEditable = useCallback(
    () => (
      <div
        className="editor-scroller"
        style={{ resize: editable ? "vertical" : "none" }}
      >
        <div className="editor" ref={onRef}>
          <ContentEditable
            className={editable ? "content-editable" : ""}
            aria-placeholder={placeholder}
            placeholder={
              <div
                className="content-editable-placeholder"
                style={{ color: token.colorTextPlaceholder }}
              >
                {placeholder}
              </div>
            }
          />
        </div>
      </div>
    ),
    [editable, onRef, placeholder, token]
  );

  function onEditorChange(editorState: EditorState) {
    if (!onChange) {
      return;
    }
    onChange(JSON.stringify(editorState.toJSON()));
  }

  useEffect(() => {
    if (!value || editable) {
      return;
    }
    try {
      const editorState = editor.parseEditorState(value);
      editor.setEditorState(editorState);
    } catch (err) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(value));
        root.append(paragraph);
      });
    }
  }, [value, editor, editable]);

  return (
    <div style={containerStyle}>
      {!editable ? (
        <>
          <RichTextPlugin
            ErrorBoundary={LexicalErrorBoundary}
            contentEditable={renderContentEditable()}
          />
        </>
      ) : (
        <>
          <ToolbarPlugin
            editor={editor}
            activeEditor={activeEditor}
            setActiveEditor={setActiveEditor}
            setIsLinkEditMode={setIsLinkEditMode}
          />
          <RichTextPlugin
            ErrorBoundary={LexicalErrorBoundary}
            contentEditable={renderContentEditable()}
          />
          {floatingAnchorElem && !isSmallWidthViewport && (
            <>
              <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
              <FloatingLinkEditorPlugin
                anchorElem={floatingAnchorElem}
                isLinkEditMode={isLinkEditMode}
                setIsLinkEditMode={setIsLinkEditMode}
              />
              <FloatingTextFormatToolbarPlugin
                anchorElem={floatingAnchorElem}
                setIsLinkEditMode={setIsLinkEditMode}
              />
            </>
          )}
          {maxLength && <MaxLengthPlugin maxLength={maxLength} />}
          <OnChangePlugin
            ignoreSelectionChange={true}
            ignoreHistoryMergeTagChange={true}
            onChange={onEditorChange}
          />
          <HistoryPlugin />
          <ListPlugin />
          <CheckListPlugin />
          <CodeHighlightPlugin />
          <LinkPlugin />
          <HorizontalRulePlugin />
          <HashtagPlugin />
          <LexicalAutoLinkPlugin />
          <TabIndentationPlugin />
          <MarkdownShortcutPlugin />
          <ListMaxIndentLevelPlugin />
        </>
      )}
    </div>
  );
}

const Lexical = ({
  placeholder = "请输入",
  maxLength,
  editable = true,
  value,
  emptyDescription,
  onChange,
}: EditorProps) => {
  const editorConfig: InitialConfigType = useMemo(
    () => ({
      namespace: "Lexical",
      nodes: [...EditorNodes],
      editorState: value,
      onError(error: Error) {
        throw error;
      },
      theme: EditorTheme,
    }),
    []
  );

  return !editable && (!value || value.length == 0) ? (
    <Empty description={emptyDescription} />
  ) : (
    <LexicalComposer initialConfig={editorConfig}>
      <Editor
        placeholder={editable ? placeholder : ""}
        maxLength={maxLength}
        editable={editable}
        value={value}
        onChange={onChange}
      />
    </LexicalComposer>
  );
};
// code source: https://playground.lexical.dev/
export default Lexical;
