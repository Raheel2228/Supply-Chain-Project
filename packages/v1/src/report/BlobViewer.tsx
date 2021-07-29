import React, {
  useEffect,
  useRef,
  useState,
  memo,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { ReportBlob } from "./Reports";
import { useAuthFetch } from "../util/api";
import { getTheme, Theme } from "../common/Theme";
import DelayedSpinner from "../common/DelayedSpinner";
const MarkdownBlobViewer = lazy(() => import("./MarkdownBlobViewer"));

export interface IBlobViewerProps {
  blob: ReportBlob;
  publicMode?: boolean;
}

function BlobViewer(props: IBlobViewerProps) {
  const type = props.blob.type;
  if (type.toLowerCase().includes("themed")) {
    return <IframeBlobViewer themed {...props} />;
  }
  if (type.toLowerCase().includes("iframe")) {
    return <IframeBlobViewer {...props} />;
  }
  if (type.toLowerCase().includes("html")) {
    return <HTMLBlobViewer {...props} />;
  }
  if (type.toLowerCase().includes("markdown")) {
    return (
      <Suspense fallback={<DelayedSpinner />}>
        <MarkdownBlobViewer {...props} />
      </Suspense>
    );
  }
  return <>{JSON.stringify(props.blob, null, 2)}</>;
}

// Prevent iframes from unnecessarily reloading on re-render
export default memo(BlobViewer);

interface IIframeBlobViewerProps extends IBlobViewerProps {
  themed?: boolean;
}
const darkThemeRegexp = /<html class="theme-dark">.*?<\/html>/is;
const lightThemeRegexp = /<html class="theme-light">.*?<\/html>/is;

function IframeBlobViewer({
  blob,
  themed = false,
  publicMode,
}: IIframeBlobViewerProps) {
  const authFetch = useAuthFetch();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const downloadUrl = `/reportBlobs/${publicMode ? "public/" : ""}${
    blob.id
  }/download`;

  const updateIframe = useCallback((url) => {
    if (iframeRef.current) {
      iframeRef.current.src = url;
      // https://www.tutorialrepublic.com/faq/automatically-adjust-iframe-height-according-to-its-contents-using-javascript.php
      iframeRef.current.onload = () => {
        try {
          iframeRef.current!.height =
            iframeRef.current!.contentWindow?.document.body.scrollHeight + "px";
        } catch (error) {
          console.error("iframe update error", error);
        }
      };
    }
  }, []);

  useEffect(() => {
    // Declare here so it can be revoked outside of promise
    let dataUrl: string;
    authFetch(downloadUrl, {}, false)
      .then(async (response) => {
        try {
          const responseBlob = await response.blob();
          if (themed) {
            // Themed blobs have two html tags, and we remove the one not used for the current theme
            // <html class="theme-light">....</html>
            // <html class="theme-dark">....</html>
            // Get string from blob
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
              let dataString = (e.target?.result as string) || "";

              // Remove the *opposite* theme (leaving any unthemed things)
              const themeRegexp =
                getTheme() === Theme.DARK ? lightThemeRegexp : darkThemeRegexp;
              dataString = dataString.replace(themeRegexp, "");
              dataUrl = URL.createObjectURL(
                new Blob([dataString], { type: responseBlob.type })
              );
              updateIframe(dataUrl);
            };
            reader.readAsText(responseBlob);
          } else {
            // Create URL directly from blob
            // Use https://stackoverflow.com/a/42280209/702643
            dataUrl = URL.createObjectURL(responseBlob);
            updateIframe(dataUrl);
          }
        } catch (error) {
          console.log(error);
        }
      })
      .catch((error) => {
        console.log(error);
      });
    return () => {
      dataUrl && URL.revokeObjectURL(dataUrl);
    };
  }, [authFetch, downloadUrl, themed, updateIframe]);

  return <iframe className="blob-iframe" ref={iframeRef} title={blob.title} />;
}

function HTMLBlobViewer({ blob, publicMode }: IBlobViewerProps) {
  const authFetch = useAuthFetch();
  const [rawHtml, setRawHtml] = useState<string>("");
  const downloadUrl = `/reportBlobs/${publicMode ? "public/" : ""}${
    blob.id
  }/download`;

  useEffect(() => {
    authFetch(downloadUrl, {}, false)
      .then(async (response) => {
        try {
          setRawHtml(await response.text());
        } catch (error) {
          console.log(error);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [authFetch, downloadUrl]);

  return (
    <div className="blob-html" dangerouslySetInnerHTML={{ __html: rawHtml }} />
  );
}
