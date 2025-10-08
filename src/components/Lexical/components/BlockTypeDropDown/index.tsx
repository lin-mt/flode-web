import { $createCodeNode } from "@lexical/code";
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingTagType,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { Dropdown } from "antd";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  LexicalEditor,
} from "lexical";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  SquareCode,
  TextQuote,
  WrapText,
} from "lucide-react";
import { BlockTypeToBlockName } from "./constant";

type BlockTypeDropDownProps = {
  editor: LexicalEditor;
  blockType: keyof typeof BlockTypeToBlockName;
};

export default function BlockTypeDropDown({
  editor,
  blockType,
}: BlockTypeDropDownProps) {
  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  const formatCheckList = () => {
    if (blockType !== "check") {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  const formatNumberedList = () => {
    if (blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createQuoteNode());
      });
    }
  };

  const formatCode = () => {
    if (blockType !== "code") {
      editor.update(() => {
        let selection = $getSelection();
        if (selection !== null) {
          if (selection.isCollapsed()) {
            $setBlocksType(selection, () => $createCodeNode());
          } else {
            const textContent = selection.getTextContent();
            const codeNode = $createCodeNode();
            selection.insertNodes([codeNode]);
            selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.insertRawText(textContent);
            }
          }
        }
      });
    }
  };

  return (
    <Dropdown
      menu={{
        items: [
          {
            key: "paragraph",
            icon: <WrapText />,
            label: "正文",
            onClick: formatParagraph,
          },
          {
            type: "divider",
          },
          {
            key: "h1",
            icon: <Heading1 />,
            label: "一级标题",
            onClick: () => formatHeading("h1"),
          },
          {
            key: "h2",
            icon: <Heading2 />,
            label: "二级标题",
            onClick: () => formatHeading("h2"),
          },
          {
            key: "h3",
            icon: <Heading3 />,
            label: "三级标题",
            onClick: () => formatHeading("h3"),
          },
          {
            type: "divider",
          },
          {
            key: "bullet",
            icon: <List />,
            label: "无序列表",
            onClick: formatBulletList,
          },
          {
            key: "number",
            icon: <ListOrdered />,
            label: "有序列表",
            onClick: formatNumberedList,
          },
          {
            key: "check",
            icon: <ListTodo />,
            label: "待办列表",
            onClick: formatCheckList,
          },
          {
            type: "divider",
          },
          {
            key: "code",
            icon: <SquareCode />,
            label: "代码块",
            onClick: formatCode,
          },
          {
            key: "quote",
            icon: <TextQuote />,
            label: "引用",
            onClick: formatQuote,
          },
        ],
      }}
    >
      {BlockTypeToBlockName[blockType]}
    </Dropdown>
  );
}
