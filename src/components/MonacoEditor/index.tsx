import Editor, { OnChange } from "@monaco-editor/react";
import { theme } from "antd";
import { ReactElement } from "react";
import { xcodeDefault } from "./themes";

interface EditorProp {
  width?: string | number;
  height?: string | number;
  value?: string;
  language?: string;
  readOnly?: boolean;
  lineNumbers?: "on" | "off" | "relative" | "interval";
  folding?: boolean;
  minimap?: boolean;
  renderLineHighlight?: "all" | "line" | "none" | "gutter";
  wordWrap?: "off" | "on" | "wordWrapColumn" | "bounded";
  onChange?: OnChange;
  placeholder?: string;
  handleEditorDidMount?: (editor: any, monaco: any) => void;
}

const MonacoEditor = (props: EditorProp): ReactElement => {
  const {
    width,
    lineNumbers = "on",
    height,
    value,
    folding = true,
    language,
    readOnly = false,
    minimap = true,
    renderLineHighlight = "all",
    wordWrap = "off",
    placeholder,
    onChange,
  } = props;

  const { token } = theme.useToken();

  function editorWillMount(monaco: any) {
    monaco.editor.defineTheme("x-code-default", xcodeDefault);
  }

  return (
    <div
      style={{
        border: `1px solid ${token.colorBorder}`,
        width: width ? width : "100%",
      }}
    >
      <Editor
        height={height}
        width={width}
        value={value}
        language={language}
        onChange={onChange}
        onMount={props.handleEditorDidMount}
        beforeMount={editorWillMount}
        theme="x-code-default"
        options={{
          // 只读
          readOnly,
          placeholder,
          // 关闭行数显示
          lineNumbers,
          // 关闭选中行的渲染
          renderLineHighlight,
          // 是否折叠
          folding,
          wordWrap,
          smoothScrolling: true,
          // 编辑器中字体大小
          fontSize: 13,
          // 是否可以滚动到最后一行，可以往上滚动超出内容范围
          scrollBeyondLastLine: false,
          // 左边空出来的宽度
          // lineDecorationsWidth: 5,
          // lineNumbersMinChars: 3,
          // 滚动条样式
          scrollbar: {
            verticalScrollbarSize: 9,
            horizontalScrollbarSize: 9,
            alwaysConsumeMouseWheel: false,
          },
          // 小地图
          minimap: {
            enabled: minimap,
          },
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          automaticLayout: true,
          formatOnType: true,
        }}
      />
    </div>
  );
};

export default MonacoEditor;
