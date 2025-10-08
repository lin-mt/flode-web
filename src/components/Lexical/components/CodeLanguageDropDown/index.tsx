import { $isCodeNode, getLanguageFriendlyName } from "@lexical/code";
import { Button, Dropdown } from "antd";
import { $getNodeByKey, LexicalEditor, NodeKey } from "lexical";
import { ChevronDown } from "lucide-react";
import { useCallback } from "react";
import { CODE_LANGUAGE_OPTIONS } from "./language";

type LanguageCodeDropDownProps = {
  editor: LexicalEditor;
  codeLanguage: string;
  selectedElementKey: NodeKey | null;
};

export default function LanguageCodeDropDown({
  editor,
  codeLanguage,
  selectedElementKey,
}: LanguageCodeDropDownProps) {
  const onCodeLanguageSelect = useCallback(
    (value: string) => {
      editor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
          }
        }
      });
    },
    [editor, selectedElementKey]
  );

  return (
    <Dropdown
      menu={{
        items: CODE_LANGUAGE_OPTIONS.map(([value, name]) => ({
          key: value,
          label: <>{name}</>,
          onClick: () => onCodeLanguageSelect(value),
        })),
      }}
    >
      <Button type={"text"} style={{ paddingLeft: 6, paddingRight: 6 }}>
        {getLanguageFriendlyName(codeLanguage)}
        <ChevronDown />
      </Button>
    </Dropdown>
  );
}
