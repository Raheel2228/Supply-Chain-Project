import React, { useEffect, useState } from "react";
import { Prompt } from "react-router";
import marked from "marked";
import { sanitize } from "dompurify";
import { Button, Classes } from "@blueprintjs/core";
import MarkdownEditor, { Plugins } from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";

import { useAuthFetch } from "../util/api";
import { AppToaster } from "../common/toaster";
import { IBlobViewerProps } from "./BlobViewer";

// Configure markdown editor
MarkdownEditor.unuse(Plugins.Header);
MarkdownEditor.unuse(Plugins.FontUnderline);

// The markdown HTML must always be sanitized
const HTMLRenderer = (markdownText: string) => sanitize(marked(markdownText));

export default function MarkdownBlobViewer({
  blob,
  publicMode,
}: IBlobViewerProps) {
  const authFetch = useAuthFetch();

  const [markdownText, setMarkdownText] = useState<string>("");
  // Holds changes while editing
  const [draftMarkdownText, setDraftMarkdownText] = useState<string>("");
  const [editMode, setEditMode] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const downloadUrl = `/reportBlobs/${publicMode ? "public/" : ""}${
    blob.id
  }/download`;

  useEffect(() => {
    authFetch(downloadUrl, {}, false)
      .then(async (response) => {
        try {
          setMarkdownText(await response.text());
        } catch (error) {
          console.log(error);
        }
      })
      .catch((error) => {
        console.log(error);
      });
    // TODO figure out how to make authFetch stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downloadUrl]);

  const handleEdit = () => {
    setDraftMarkdownText(markdownText);
    setEditMode(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append(
        "reportBlob",
        new Blob([draftMarkdownText], { type: "text/markdown" })
      );

      const uploadResult = await authFetch(
        `/reportBlobs/${blob.id}`,
        { method: "PUT", body: formData },
        false
      );
      // Since we specified not JSON, we have to manually handle response
      const json = await uploadResult.json();
      if (!json.success) throw json.message;
      // Switch back to preview
      setMarkdownText(draftMarkdownText);
      setEditMode(false);
    } catch (error) {
      AppToaster.show({
        message:
          "Error saving changes. Please copy your text to a backup document and try again.",
        intent: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  const contents =
    editMode ? (
      <MarkdownEditor
        value={draftMarkdownText}
        onChange={({ text }) => setDraftMarkdownText(text)}
        renderHTML={HTMLRenderer}
        config={{
          shortcuts: true,
          htmlClass: Classes.RUNNING_TEXT,
          canView: { hideMenu: false, fullScreen: false },
        }}
      />
    ) : (
      <div
        className="blob-markdown-preview"
        // HTMLRenderer includes a sanitization step
        dangerouslySetInnerHTML={{ __html: HTMLRenderer(markdownText) }}
      />
    );

  return (
    <section className={`blob-markdown ${!publicMode ? "editable" : ""}`}>
      {!publicMode &&
        (editMode ? (
          <div className="toolbar-extension">
            <Button
              text="Cancel"
              className="cancel-button"
              onClick={() => setEditMode(false)}
            />
            <Button
              intent="primary"
              text="Save"
              className="save-button"
              loading={saving}
              onClick={handleSave}
            />
          </div>
        ) : (
          <Button
            icon="edit"
            text="Edit"
            className="edit-button"
            minimal
            onClick={handleEdit}
          />
        ))}
      {contents}
      <Prompt when={editMode} message="Discard changes to this report?" />
    </section>
  );
}
