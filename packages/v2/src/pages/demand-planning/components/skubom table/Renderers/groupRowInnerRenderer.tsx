import React, { useEffect, useState } from "react";

export default (props: any) => {
  const node = props.node;
  const aggData = node.aggData;

  const [countryName, setCountryName] = useState(node.key);

  const refreshUi = () => {
    const node = props.node;
    const aggData = node.aggData;
    setCountryName(node.key);
  };

  const dataChangedListener = () => refreshUi();

  useEffect(() => {
    props.api.addEventListener("cellValueChanged", dataChangedListener);
    props.api.addEventListener("filterChanged", dataChangedListener);

    return () => {
      props.api.removeEventListener("cellValueChanged", dataChangedListener);
      props.api.removeEventListener("filterChanged", dataChangedListener);
    };
  }, []);

  return (
    <div style={{ display: "inline-block" }}>
      <span className="groupTitle">{countryName}</span>
    </div>
  );
};
