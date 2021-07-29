import React from "react";
import { MenuItem } from "@blueprintjs/core";
import { ItemRenderer, MultiSelect } from "@blueprintjs/select";
import { useApi } from "../util/api";

export const renderCreateTagOption = (
  query: string,
  active: boolean,
  handleClick: React.MouseEventHandler<HTMLElement>
) => (
  <MenuItem
    icon="add"
    text={`Create "${query}"`}
    active={active}
    onClick={handleClick}
    shouldDismissPopover={false}
  />
);

const areTagsEqual = (a: string, b: string) =>
  a.toLowerCase() === b.toLowerCase();

const TagMultiSelect = MultiSelect.ofType<string>();

interface ITagSelectorProps {
  clientId: string;
  tags: string[];
  onChange: (newTags: string[]) => void;
  allowTagCreation?: boolean;
  label?: string;
  fill?: boolean;
}

export default function TagSelector({
  clientId,
  tags,
  onChange,
  allowTagCreation = false,
  label = "Filter by tags…",
  fill = false,
}: ITagSelectorProps) {
  const { data, loading, fire } = useApi(
    `/clients/${clientId}/tags`,
    {},
    false
  );

  const allTags = data?.tags || [];

  const handleTagSelect = (tag: string) => {
    const tagIndex = tags.indexOf(tag);
    if (tagIndex === -1) {
      onChange([...tags, tag]);
    } else {
      onChange(tags.filter((_tag) => !areTagsEqual(_tag, tag)));
    }
  };

  const handleTagRemove = (tag: string, index: number) => {
    onChange(tags.filter((_tag, i) => i !== index));
  };

  const renderTag: ItemRenderer<string> = (tag, { modifiers, handleClick }) => {
    if (!modifiers.matchesPredicate) {
      return null;
    }
    return (
      <MenuItem
        active={modifiers.active}
        icon={tags.includes(tag) ? "tick" : "blank"}
        key={tag}
        onClick={handleClick}
        text={tag}
        shouldDismissPopover={false}
      />
    );
  };

  return (
    <>
      <TagMultiSelect
        createNewItemFromQuery={allowTagCreation ? (name) => name : undefined}
        createNewItemRenderer={
          allowTagCreation ? renderCreateTagOption : undefined
        }
        fill={fill}
        itemPredicate={(query, item) =>
          item.toLowerCase().includes(query.toLowerCase())
        }
        itemRenderer={renderTag}
        itemsEqual={areTagsEqual}
        items={allTags}
        noResults={
          <MenuItem
            disabled={true}
            text={loading ? "Loading…" : "No results."}
          />
        }
        onItemSelect={handleTagSelect}
        popoverProps={{ minimal: true }}
        tagRenderer={(tag) => tag}
        tagInputProps={{
          leftIcon: "tag",
          // @ts-ignore
          onRemove: handleTagRemove,
          addOnBlur: true,
          inputProps: {
            onFocus: () => {
              if (allTags.length === 0) {
                fire();
              }
            },
          },
        }}
        placeholder={label}
        selectedItems={tags}
        resetOnSelect
      />
    </>
  );
}
