import React from "react";
import { Tag } from "@blueprintjs/core";

interface ITagListProps {
  tags: string[];
}

export default function TagList({ tags }: ITagListProps) {
  if (tags.length === 0) return null
  return (
    <div className="tag-list-row">
      {tags.map((tag) => (
        <Tag key={tag} minimal>{tag}</Tag>
      ))}
    </div>
  );
}
