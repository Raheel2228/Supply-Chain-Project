import React, { FC } from "react";
import { RoundedButton } from "./styles";

interface Props {
  hidden?: any;
  onClick?: any;
  icon?: React.ReactNode;
  size?: "small" | "middle" | "large";
  type: "rounded-outline" | "rounded-filled";
  style?: React.CSSProperties;
  color?: string;
  htmlType?: any;
}

const Buttons: FC<Props> = ({
  size,
  children,
  icon,
  type,
  onClick,
  style,
  color,
  htmlType,
  hidden,
  ...rest
}) => {
  switch (type) {
    case "rounded-outline":
      return (
        <RoundedButton
          hidden={hidden}
          type="primary"
          icon={icon}
          size={size}
          ghost={true}
          style={style}
          color={color}
          onClick={onClick}
          htmlType={htmlType}
          {...rest}
        >
          {children}
        </RoundedButton>
      );
    case "rounded-filled":
      return (
        <RoundedButton
          hidden={hidden}
          type="primary"
          icon={icon}
          size={size}
          ghost={false}
          style={style}
          color={color}
          onClick={onClick}
          htmlType={htmlType}
          {...rest}
        >
          {children}
        </RoundedButton>
      );

    default:
      return (
        <RoundedButton
          hidden={hidden}
          type="primary"
          icon={icon}
          size={size}
          ghost={true}
          color={color}
          onClick={onClick}
          htmlType={htmlType}
        >
          {children}
        </RoundedButton>
      );
  }
};

export default Buttons;
