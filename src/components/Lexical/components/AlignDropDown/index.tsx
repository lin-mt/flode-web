import { ToolbarButton } from "@/components/Lexical/components";
import { Button, Dropdown } from "antd";
import {
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  LexicalEditor,
  OUTDENT_CONTENT_COMMAND,
} from "lexical";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ChevronDown,
  IndentDecrease,
  IndentIncrease,
} from "lucide-react";

type AlignDropDownProps = {
  editor: LexicalEditor;
  disabled?: boolean;
  elementFormat: ElementFormatType;
};

function getElementFormatName(elementFormat: ElementFormatType) {
  switch (elementFormat) {
    case "left":
      return (
        <ToolbarButton icon={<AlignLeft />}>
          左对齐
          <ChevronDown />
        </ToolbarButton>
      );
    case "center":
      return (
        <ToolbarButton icon={<AlignCenter />}>
          居中对齐
          <ChevronDown />
        </ToolbarButton>
      );
    case "right":
      return (
        <ToolbarButton icon={<AlignRight />}>
          右对齐
          <ChevronDown />
        </ToolbarButton>
      );
    case "justify":
      return (
        <ToolbarButton icon={<AlignJustify />}>
          两端对齐
          <ChevronDown />
        </ToolbarButton>
      );
    default:
      return <Button>暂不支持</Button>;
  }
}

export default function AlignDropDown({
  editor,
  elementFormat,
}: AlignDropDownProps) {
  return (
    <Dropdown
      menu={{
        items: [
          {
            key: "left",
            icon: <AlignLeft />,
            label: "左对齐",
            onClick: () =>
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left"),
          },
          {
            key: "center",
            icon: <AlignCenter />,
            label: "居中对齐",
            onClick: () =>
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center"),
          },
          {
            key: "right",
            icon: <AlignRight />,
            label: "右对齐",
            onClick: () =>
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right"),
          },
          {
            key: "justify",
            icon: <AlignJustify />,
            label: "两端对齐",
            onClick: () =>
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify"),
          },
          {
            type: "divider",
          },
          {
            key: "indentDecrease",
            icon: <IndentDecrease />,
            label: "减少缩进",
            onClick: () =>
              editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined),
          },
          {
            key: "IndentIncrease",
            icon: <IndentIncrease />,
            label: "添加缩进",
            onClick: () =>
              editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined),
          },
        ],
      }}
    >
      {getElementFormatName(elementFormat || "left")}
    </Dropdown>
  );
}
