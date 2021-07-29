import React, { useState, useRef, useCallback } from "react";
import { Dataset } from "../util/scriptSchema";
import { useApi } from "../util/api";
import DelayedSpinner from "../common/DelayedSpinner";
import {
  Callout,
  HTMLTable,
  Icon,
  NonIdealState,
  Button,
  FormGroup,
  Tag,
  Spinner,
} from "@blueprintjs/core";
import { formatTimestamp } from "../util/date";
import DatasetDrawer from "./DatasetDrawer";
import Paginate from "../nav/Paginate";
import TagSelector from "../common/TagSelector";
import DebouncedInputGroup from "../common/DebouncedInputGroup";
import TagList from "../common/TagList";
import StateFilter, { StateFilterValue } from "../common/StateFilter";

export enum DatasetListMode {
  SELECT,
  PREVIEW,
}

interface IDatasetListProps {
  clientId: string;
  typeFilter?: string;
  // Called when a dataset row is clicked (if in select mode)
  onSelect?: (dataset: Dataset) => void;
  // If this is provided and it is set to select mode, DatasetList can be used as a controlled component
  selectedId?: string;
  mode?: DatasetListMode;
}

export default function DatasetList({
  clientId,
  onSelect,
  typeFilter,
  selectedId,
  mode = DatasetListMode.PREVIEW,
}: IDatasetListProps) {
  const [previewDataset, setPreviewDataset] = useState<Dataset | undefined>();

  const filterRowRef = useRef<HTMLDivElement | null>(null);
  const [filterText, setFilterText] = useState<string>("");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterState, setFilterState] = useState<StateFilterValue>(
    StateFilterValue.ALL
  );
  const [page, setPage] = useState(1);
  const pageSize = 100;

  // Join with commas to put in query param
  const joinedFilterTags = filterTags.join(",");

  const filterParams = new URLSearchParams({
    clientId,
    ...(typeFilter && { type: typeFilter }),
    ...(filterText && { filterText }),
    ...(filterTags && { filterTags: joinedFilterTags }),
    state: filterState,
    page: page.toString(),
    pageSize: pageSize.toString(),
  }).toString();
  const { loading, error, data, fire } = useApi(`/datasets?${filterParams}`);

  const handleFilterTextChange = useCallback((newValue) => {
    setFilterText(newValue);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top of table
    filterRowRef.current?.scrollIntoView();
  };

  if (error) {
    return <Callout intent="danger">{String(error)}</Callout>;
  }

  const empty =
    data?.datasets?.length === 0 &&
    page === 1 &&
    filterText === "" &&
    filterTags.length === 0 &&
    filterState === StateFilterValue.ALL &&
    !loading;

  let content;

  if (!data?.datasets) {
    content = <DelayedSpinner />;
  } else if (empty) {
    content = (
      <NonIdealState
        title={`No Datasets Found${typeFilter ? ` of Type ${typeFilter}` : ""}`}
        description="Upload a dataset in a model."
        icon="database"
      />
    );
  } else {
    content = (
      <>
        <HTMLTable
          interactive
          striped
          style={{ width: "100%" }}
          className="sticky-header"
        >
          <thead>
            <tr>
              <th>Title</th>
              <th>Tags</th>
              {!typeFilter && <th>Type</th>}
              <th>
                Created At &nbsp; <Icon icon="sort-desc" />
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.datasets.map((dataset: Dataset, i: number) => (
              <tr
                key={dataset.id}
                onClick={() => handleDatasetClick(dataset)}
                className={
                  selectedId === dataset.id ? "selected-dataset-row" : ""
                }
                role="button"
              >
                <td>{dataset.title}</td>
                <td>
                  {dataset.tags && (
                    <TagList tags={dataset.tags!.map(({ tag }) => tag)} />
                  )}
                </td>
                {!typeFilter && <td>{dataset.type}</td>}
                <td>{formatTimestamp(dataset.createdAt)}</td>
                <td>
                  {mode === DatasetListMode.SELECT && (
                    <Button
                      small
                      className="dataset-preview-button"
                      icon="eye-open"
                      onClick={() => setPreviewDataset(dataset)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </HTMLTable>
        {data.datasets.length === 0 && (
          <NonIdealState
            title="No Results"
            description={`
                Try adjusting your search filters. ${
                  filterTags.length > 0
                    ? "Tags are shared across all users in this workspace, so there might be results you don’t have permission to see."
                    : ""
                }
            `}
            icon="database"
          />
        )}
        <Paginate
          page={page}
          onChange={handlePageChange}
          allowNext={data.datasets.length === pageSize}
          // Handle manually, since this might be in a dialog
          scrollToTop={false}
        />
      </>
    );
  }

  const handleDatasetClick = (dataset: Dataset) => {
    switch (mode) {
      case DatasetListMode.PREVIEW:
        setPreviewDataset(dataset);
        break;
      case DatasetListMode.SELECT:
        onSelect && onSelect(dataset);
        break;
    }
  };

  return (
    <>
      {/* There is another empty check here so that the input doesn’t get unmounted and lose focus while searching, but still doesn’t show if truly empty. */}
      {!empty && (
        <div className="filter-row" ref={filterRowRef}>
          {typeFilter && (
            <div style={{ margin: "auto 8px" }}>
              <Tag icon="filter">Type: {typeFilter}</Tag>
            </div>
          )}
          <FormGroup inline>
            <DebouncedInputGroup
              fill
              leftIcon="search"
              type="text"
              placeholder={`Search by title${!typeFilter ? " or type" : ""}…`}
              value={filterText}
              onValueChange={handleFilterTextChange}
            />
          </FormGroup>
          <TagSelector
            clientId={clientId!}
            tags={filterTags}
            onChange={(newTags) => setFilterTags(newTags)}
          />
          <StateFilter
            value={filterState}
            onChange={(newState) => setFilterState(newState)}
          />
          {loading && <Spinner size={Spinner.SIZE_SMALL} />}
        </div>
      )}
      {content}
      {previewDataset && (
        <DatasetDrawer
          isOpen={!!previewDataset}
          onClose={() => setPreviewDataset(undefined)}
          dataset={previewDataset}
          onRename={(updatedDataset) => {
            setPreviewDataset(updatedDataset);
            onSelect && onSelect(updatedDataset);
            fire();
          }}
          onDelete={fire}
          onUpload={(newDataset) => {
            setPreviewDataset(newDataset);
            onSelect && onSelect(newDataset);
            fire();
          }}
          clientId={clientId}
        />
      )}
    </>
  );
}
