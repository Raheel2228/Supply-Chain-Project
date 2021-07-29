/** This wraps BluePrintJS’s InputGroup to debounce the onChange event */
/** Based on code from https://github.com/nkbt/react-debounce-input/blob/master/src/Component.js (MIT License) */
import React, { useState, useCallback, ChangeEvent } from "react";
import { InputGroup, IInputGroupProps } from "@blueprintjs/core";
import debounce from "lodash.debounce";

interface IDebouncedInputGroupProps extends IInputGroupProps {
  debounceTimeout?: number;
  onValueChange: (newValue: string) => void;
  onChange?: never;
}

export default function DebouncedInputGroup({
  defaultValue,
  value,
  onValueChange,
  debounceTimeout = 300,
  ...props
}: IDebouncedInputGroupProps) {
  const [internalValue, setInternalValue] = useState<string>(
    value ?? defaultValue ?? ""
  );

  const debouncedValueChange = useCallback(
    debounce((newValue: string) => onValueChange(newValue), debounceTimeout),
    [onValueChange]
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInternalValue(event.target.value);
    debouncedValueChange(event.target.value);
  };

  return (
    <InputGroup {...props} value={internalValue} onChange={handleChange} />
  );
}
