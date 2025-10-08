import { theme } from "antd";
import { ReactNode } from "react";

function SubItemTitle(props: { title: ReactNode }) {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        fontSize: token.fontSizeHeading5,
        borderLeft: `2px solid ${token.colorPrimary}`,
        paddingLeft: 6,
        fontWeight: 460,
        lineHeight: "24px",
        marginBottom: 10,
      }}
    >
      {props.title}
    </div>
  );
}

export default SubItemTitle;
