import { Button, ButtonProps, Divider, DividerProps, Tooltip } from "antd";
import { FC } from "react";

export const ToolbarButton: FC<ButtonProps & { tooltip?: string }> = ({
  ...rest
}) => {
  return (
    <Tooltip title={rest.tooltip}>
      <Button
        {...rest}
        type="text"
        icon={undefined}
        style={{ paddingLeft: 6, paddingRight: 6, ...rest.style }}
      >
        {rest.icon}
        {rest.children}
      </Button>
    </Tooltip>
  );
};

export const ToolbarDivider: FC<DividerProps> = ({ ...rest }) => {
  return (
    <Divider
      type={"vertical"}
      style={{ height: "auto", top: "unset" }}
      {...rest}
    />
  );
};
