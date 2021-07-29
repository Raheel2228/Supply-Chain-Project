import React from "react";
import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";

export default (props: any) => (
  <Tooltip title="Remove SKU">
    <Button
      className="skuAddButton"
      shape="circle"
      size="small"
      icon={<MinusCircleOutlined />}
    />
  </Tooltip>
);
