import type { GlobalToken } from "antd/es/theme/interface";
import React from "react";

export function getActiveBgColor(
  isActive: boolean,
  token: GlobalToken
): React.CSSProperties {
  return isActive ? { backgroundColor: token.controlItemBgActive } : {};
}
