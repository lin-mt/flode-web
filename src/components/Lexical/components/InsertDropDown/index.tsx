import { ToolbarButton } from "@/components/Lexical/components";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { Dropdown } from "antd";
import { LexicalEditor } from "lexical";
import { ChevronDown, Plus, Rows2 } from "lucide-react";

type InsertDropDownProps = {
  activeEditor: LexicalEditor;
};

export default function InsertDropDown({ activeEditor }: InsertDropDownProps) {
  return (
    <>
      <Dropdown
        menu={{
          items: [
            {
              key: "separator",
              icon: <Rows2 />,
              label: "分割线",
              onClick: () => {
                activeEditor.dispatchCommand(
                  INSERT_HORIZONTAL_RULE_COMMAND,
                  undefined
                );
              },
            },
          ],
        }}
      >
        <ToolbarButton icon={<Plus />}>
          插入
          <ChevronDown />
        </ToolbarButton>
      </Dropdown>
    </>
  );
}
