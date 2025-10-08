import { ToolbarButton } from "@/components/Lexical/components";
import {
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  ListTodo,
  SquareCode,
  TextQuote,
  WrapText,
} from "lucide-react";

const blockTypeToButtonProps = {
  paragraph: { icon: <WrapText />, text: "正文" },
  h1: { icon: <Heading1 />, text: "一级标题" },
  h2: { icon: <Heading2 />, text: "二级标题" },
  h3: { icon: <Heading3 />, text: "三级标题" },
  h4: { icon: <Heading4 />, text: "四级标题" },
  h5: { icon: <Heading5 />, text: "五级标题" },
  h6: { icon: <Heading6 />, text: "六级标题" },
  bullet: { icon: <List />, text: "无序列表" },
  number: { icon: <ListOrdered />, text: "有序列表" },
  check: { icon: <ListTodo />, text: "待办列表" },
  code: { icon: <SquareCode />, text: "代码块" },
  quote: { icon: <TextQuote />, text: "引用" },
};

export const BlockTypeToBlockName = Object.fromEntries(
  Object.entries(blockTypeToButtonProps).map(([key, { icon, text }]) => [
    key,
    <ToolbarButton icon={icon}>
      {text}
      <ChevronDown />
    </ToolbarButton>,
  ])
);
