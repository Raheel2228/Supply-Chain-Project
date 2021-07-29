import React from "react";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";

export default (props: any) => (
  <Tooltip title="Add SKU">
    <Button
      className="skuAddButton"
      shape="circle"
      size="small"
      icon={<PlusCircleOutlined />}
    />
  </Tooltip>
);
