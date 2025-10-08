import { Alert, AlertProps } from "antd";
import React, { useState } from "react";

export enum AlertStorageKey {
  INTRODUCE = "INTRODUCE",
}

type AlertOneTimeProps = AlertProps & {
  storageKey: AlertStorageKey;
};

const AlertOneTime = (props: AlertOneTimeProps) => {
  const { storageKey, onClose } = props;

  const [alerted, setAlerted] = useState<boolean>(
    !!localStorage.getItem(storageKey)
  );

  function handleOnClose(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    localStorage.setItem(storageKey.toString(), "alerted");
    setAlerted(true);
    if (onClose) {
      onClose(e);
    }
  }

  return !alerted ? <Alert {...props} onClose={handleOnClose} /> : undefined;
};

export default AlertOneTime;
