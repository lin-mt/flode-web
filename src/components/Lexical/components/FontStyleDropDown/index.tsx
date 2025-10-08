import { ToolbarButton } from "@/components/Lexical/components";
import { $patchStyleText } from "@lexical/selection";
import { Dropdown } from "antd";
import { $getSelection, LexicalEditor } from "lexical";
import { ChevronDown, Type } from "lucide-react";
import { useCallback } from "react";

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ["宋体", "宋体"],
  ["黑体", "黑体"],
  ["仿宋", "仿宋"],
  ["华文仿宋", "华文仿宋"],
  ["楷体", "楷体"],
  ["华文楷体", "华文楷体"],
  ["微软雅黑", "微软雅黑"],
  ["Arial", "Arial"],
  ["Courier New", "Courier New"],
  ["Georgia", "Georgia"],
  ["Times New Roman", "Times New Roman"],
  ["Trebuchet MS", "Trebuchet MS"],
  ["Verdana", "Verdana"],
];

const FONT_SIZE_OPTIONS: [string, string][] = [
  ["10px", "10px"],
  ["11px", "11px"],
  ["12px", "12px"],
  ["13px", "13px"],
  ["14px", "14px"],
  ["15px", "15px"],
  ["16px", "16px"],
  ["17px", "17px"],
  ["18px", "18px"],
  ["19px", "19px"],
  ["20px", "20px"],
];

type FontStyleDropDownProps = {
  editor: LexicalEditor;
  style: "font-family" | "font-size";
  value: string;
  disabled?: boolean;
};

export default function FontStyleDropDown({
  editor,
  style,
  value,
}: FontStyleDropDownProps) {
  const handleClick = useCallback(
    (option: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection !== null) {
          $patchStyleText(selection, {
            [style]: option,
          });
        }
      });
    },
    [editor, style]
  );

  return (
    <Dropdown
      menu={{
        items: (style === "font-family"
          ? FONT_FAMILY_OPTIONS
          : FONT_SIZE_OPTIONS
        ).map(([option, text]) => ({
          key: option,
          label: text,
          style:
            style === "font-family"
              ? { fontFamily: option }
              : { fontSize: option },
          onClick: () => handleClick(option),
        })),
      }}
    >
      <ToolbarButton icon={<Type />}>
        {value}
        <ChevronDown />
      </ToolbarButton>
    </Dropdown>
  );
}
