import React, { useState, useEffect } from "react";
import { Spinner, ISpinnerProps } from "@blueprintjs/core";

const DelayedSpinner = (props: ISpinnerProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(timer);
  });

  return visible ? <Spinner {...props} /> : null;
};

export default DelayedSpinner;
