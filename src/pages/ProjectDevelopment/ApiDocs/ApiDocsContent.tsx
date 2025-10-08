import ItemTitle from "@/pages/ProjectDevelopment/ApiDocs/ItemTitle";
import { Flex } from "antd";
import { CSSProperties, ReactNode, useMemo } from "react";

function ApiDocsContent(props: {
  title: ReactNode;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const contentStyle: CSSProperties = useMemo(
    () => ({
      paddingLeft: 15,
      paddingRight: 15,
    }),
    []
  );
  return (
    <Flex vertical gap={"middle"} style={{ ...props.style }}>
      <ItemTitle title={props.title} />
      <Flex vertical gap={"small"} style={contentStyle}>
        {props.children}
      </Flex>
    </Flex>
  );
}

export default ApiDocsContent;
