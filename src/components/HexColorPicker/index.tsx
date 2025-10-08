import type { ColorPickerProps } from "antd";
import { ColorPicker, Space } from "antd";
import React from "react";

const HexColorPicker: React.FC = (
  props: ColorPickerProps & { onChange?: (color: string) => void }
) => {
  return (
    <Space>
      <ColorPicker
        {...props}
        format={"hex"}
        onChange={(value) => {
          if (props.onChange) {
            props.onChange(value.toHexString());
          }
        }}
      />
    </Space>
  );
};

export default HexColorPicker;
