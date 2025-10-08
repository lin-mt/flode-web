import { theme } from "antd";
import { CSSProperties, ReactNode } from "react";

function ItemTitle(props: { title: ReactNode; style?: CSSProperties }) {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        fontSize: token.fontSizeHeading4,
        borderLeft: `3px solid ${token.colorPrimary}`,
        paddingLeft: 8,
        fontWeight: 500,
        ...props.style,
      }}
    >
      {props.title}
    </div>
  );
}

export default ItemTitle;
