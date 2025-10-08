import { Col, ColorPicker, ColorPickerProps, Row, theme } from "antd";
import {
  Bold,
  Code,
  Italic,
  Link,
  PaintBucket,
  PencilLine,
  Redo2,
  Underline,
  Undo2,
} from "lucide-react";
import { ToolbarButton, ToolbarDivider } from "../../components";

import { cyan, generate, presetPalettes, red } from "@ant-design/colors";
import { $isCodeNode, CODE_LANGUAGE_MAP } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isListNode, ListNode } from "@lexical/list";
import { $isHeadingNode } from "@lexical/rich-text";
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
} from "@lexical/selection";
import { $isTableSelection } from "@lexical/table";
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  $isEditorIsNestedEditor,
  mergeRegister,
} from "@lexical/utils";
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  ElementFormatType,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  NodeKey,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { Dispatch, useCallback, useEffect, useState } from "react";
import AlignDropDown from "../../components/AlignDropDown";
import BlockTypeDropDown from "../../components/BlockTypeDropDown";
import { BlockTypeToBlockName } from "../../components/BlockTypeDropDown/constant";
import LanguageCodeDropDown from "../../components/CodeLanguageDropDown";
import FontSize from "../../components/FontSize";
import FontStyleDropDown from "../../components/FontStyleDropDown";
import InsertDropDown from "../../components/InsertDropDown";
import MarkDropDown from "../../components/MarkDropDown";
import { getActiveBgColor } from "../../utils/color";
import { getSelectedNode } from "../../utils/getSelectedNode";
import { sanitizeUrl } from "../../utils/url";
import "./index.css";

const LowPriority = 1;

type ToolbarPluginProps = {
  editor: LexicalEditor;
  activeEditor: LexicalEditor;
  setActiveEditor: Dispatch<LexicalEditor>;
  setIsLinkEditMode: Dispatch<boolean>;
};

type Presets = Required<ColorPickerProps>["presets"][number];

const genPresets = (presets = presetPalettes) =>
  Object.entries(presets).map<Presets>(([label, colors]) => ({
    label,
    colors,
  }));

export default function ToolbarPlugin({
  editor,
  activeEditor,
  setActiveEditor,
  setIsLinkEditMode,
}: ToolbarPluginProps) {
  const { token } = theme.useToken();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [blockType, setBlockType] =
    useState<keyof typeof BlockTypeToBlockName>("paragraph");
  const [fontFamily, setFontFamily] = useState<string>("宋体");
  const [fontSize, setFontSize] = useState<string>("15px");
  const [isBold, setIsBold] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [fontColor, setFontColor] = useState<string>(token.colorText);
  const [bgColor, setBgColor] = useState<string>(token.colorBgContainer);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);

  const [elementFormat, setElementFormat] = useState<ElementFormatType>("left");
  const [isImageCaption, setIsImageCaption] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<string>("");
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
    null
  );

  const presets = genPresets({
    primary: generate(token.colorPrimary),
    red,
    cyan,
  });

  const createCustomPanelRender =
    (title: string): ColorPickerProps["panelRender"] =>
    (_, { components: { Picker, Presets } }) =>
      (
        <Row justify="space-between" wrap={false}>
          <Col flex="auto">
            {title && (
              <div
                style={{
                  fontSize: 12,
                  color: token.colorText,
                  lineHeight: "20px",
                  marginBottom: 8,
                }}
              >
                {title}
              </div>
            )}
            <Picker />
          </Col>
          <ToolbarDivider />
          <Col flex={"144px"}>
            <Presets />
          </Col>
        </Row>
      );

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      if (activeEditor !== editor && $isEditorIsNestedEditor(activeEditor)) {
        const rootElement = activeEditor.getRootElement();
        setIsImageCaption(
          !!rootElement?.parentElement?.classList.contains(
            "image-caption-container"
          )
        );
      } else {
        setIsImageCaption(false);
      }

      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in BlockTypeToBlockName) {
            setBlockType(type as keyof typeof BlockTypeToBlockName);
          }
          if ($isCodeNode(element)) {
            const language =
              element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
            setCodeLanguage(
              language ? CODE_LANGUAGE_MAP[language] || language : ""
            );
            return;
          }
        }
      }
      setFontColor(
        $getSelectionStyleValueForProperty(selection, "color", token.colorText)
      );
      setBgColor(
        $getSelectionStyleValueForProperty(
          selection,
          "background-color",
          token.colorBgContainer
        )
      );
      setFontFamily(
        $getSelectionStyleValueForProperty(selection, "font-family", "宋体")
      );
      let matchingParent;
      if ($isLinkNode(parent)) {
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline()
        );
      }
      setElementFormat(
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
          ? node.getFormatType()
          : parent?.getFormatType() || "left"
      );
    }

    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));
      setIsCode(selection.hasFormat("code"));
      setFontSize(
        $getSelectionStyleValueForProperty(selection, "font-size", "15px")
      );
    }
  }, [activeEditor, editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateToolbar();
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor, $updateToolbar]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        setActiveEditor(newEditor);
        $updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, $updateToolbar, setActiveEditor]);

  const insertLink = useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true);
      activeEditor.dispatchCommand(
        TOGGLE_LINK_COMMAND,
        sanitizeUrl("https://")
      );
    } else {
      setIsLinkEditMode(false);
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [activeEditor, isLink, setIsLinkEditMode]);

  const applyStyleText = useCallback(
    (styles: Record<string, string>, skipHistoryStack?: boolean) => {
      activeEditor.update(
        () => {
          const selection = $getSelection();
          if (selection !== null) {
            $patchStyleText(selection, styles);
          }
        },
        skipHistoryStack ? { tag: "historic" } : {}
      );
    },
    [activeEditor]
  );

  const onFontColorSelect = useCallback(
    (value: string) => {
      applyStyleText({ color: value });
    },
    [applyStyleText]
  );

  const onBgColorSelect = useCallback(
    (value: string) => {
      applyStyleText({ "background-color": value });
    },
    [applyStyleText]
  );

  const showInsertDropdown = !isImageCaption;
  const showInsertCodeButton = !isImageCaption;

  return (
    <Row className={"toolbar"} style={{ borderBottomColor: token.colorBorder }}>
      <ToolbarButton
        disabled={!canUndo}
        icon={<Undo2 />}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
      />
      <ToolbarButton
        disabled={!canRedo}
        icon={<Redo2 />}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
      />
      <ToolbarDivider />
      {blockType in BlockTypeToBlockName && activeEditor === editor && (
        <>
          <BlockTypeDropDown editor={activeEditor} blockType={blockType} />
          <ToolbarDivider />
        </>
      )}
      {blockType === "code" ? (
        <LanguageCodeDropDown
          editor={activeEditor}
          codeLanguage={codeLanguage}
          selectedElementKey={selectedElementKey}
        />
      ) : (
        <>
          <FontStyleDropDown
            editor={activeEditor}
            value={fontFamily}
            style={"font-family"}
          />
          <ToolbarDivider />
          <FontSize
            selectionFontSize={fontSize.slice(0, -2)}
            editor={activeEditor}
          />
          <ToolbarDivider />
          <ToolbarButton
            tooltip={"加粗"}
            style={getActiveBgColor(isBold, token)}
            icon={<Bold style={{ strokeWidth: 2.7 }} />}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            }}
          />
          <ToolbarButton
            tooltip={"斜体"}
            style={getActiveBgColor(isItalic, token)}
            icon={<Italic />}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
            }}
          />
          <ToolbarButton
            tooltip={"下划线"}
            style={getActiveBgColor(isUnderline, token)}
            icon={<Underline />}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            }}
          />
          {showInsertCodeButton && (
            <ToolbarButton
              tooltip={"文本代码"}
              icon={<Code />}
              style={getActiveBgColor(isCode, token)}
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
              }}
            />
          )}
          <ToolbarButton
            tooltip={"链接"}
            icon={<Link />}
            style={getActiveBgColor(isLink, token)}
            onClick={insertLink}
          />
          <ColorPicker
            value={fontColor}
            styles={{ popupOverlayInner: { width: 396 } }}
            presets={presets}
            panelRender={createCustomPanelRender("字体颜色")}
            onChange={(val) => {
              onFontColorSelect(val.toHexString());
            }}
          >
            <ToolbarButton
              title={"字体颜色"}
              type={"text"}
              icon={<PencilLine />}
            />
          </ColorPicker>
          <ColorPicker
            value={bgColor}
            styles={{ popupOverlayInner: { width: 396 } }}
            presets={presets}
            panelRender={createCustomPanelRender("背景色")}
            onChange={(val) => {
              onBgColorSelect(val.toHexString());
            }}
          >
            <ToolbarButton title={"背景色"} icon={<PaintBucket />} />
          </ColorPicker>
          <MarkDropDown
            editor={editor}
            activeEditor={activeEditor}
            isStrikethrough={isStrikethrough}
            isSubscript={isSubscript}
            isSuperscript={isSuperscript}
          />
          {showInsertDropdown && (
            <>
              <ToolbarDivider />
              <InsertDropDown activeEditor={activeEditor} />
            </>
          )}
        </>
      )}
      <ToolbarDivider />
      <AlignDropDown editor={editor} elementFormat={elementFormat} />
    </Row>
  );
}
