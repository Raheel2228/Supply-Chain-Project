import React from "react";
import { ButtonGroup, Button } from "@blueprintjs/core";

interface IPaginateProps {
  page: number;
  onChange: (newPage: number) => void;
  allowNext?: boolean;
  scrollToTop?: boolean;
}

export default function Paginate({
  page,
  onChange,
  allowNext = true,
  scrollToTop = true,
}: IPaginateProps) {
  const handleChange = (newPage: number) => {
    onChange(newPage);
    if (scrollToTop) window.scrollTo({ top: 0 });
  };
  const handlePreviousClick = () => handleChange(page - 1);
  const handleNextClick = () => handleChange(page + 1);

  if (!allowNext && page <= 1) return null;

  return (
    <div style={{ textAlign: "right", margin: "16px 16px 0 0" }}>
      <Button
        minimal
        disabled
        text={`Page ${page}`}
        style={{ cursor: "default", margin: "-8px 8px 0 0" }}
      />
      <ButtonGroup>
        <Button
          large
          icon="chevron-left"
          title="Previous Page"
          onClick={handlePreviousClick}
          disabled={page <= 1}
        />
        <Button
          large
          icon="chevron-right"
          title="Next Page"
          onClick={handleNextClick}
          disabled={!allowNext}
        />
      </ButtonGroup>
    </div>
  );
}
