import { Dataset } from "./scriptSchema";
import { useAuthFetch } from "./api";
import { useState } from "react";

const downloadBlob = (blob: Blob, fileName: string) => {
  const dataUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.innerHTML = fileName;
  a.href = dataUrl;
  a.download = fileName;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

interface IDatasetDownloadResponse {
  loading: boolean;
  blob?: Blob;
  error: any;
  fire: () => void;
}

export const useDatasetDownload = (
  dataset: Dataset,
  silent = false
): IDatasetDownloadResponse => {
  const authFetch = useAuthFetch();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState();
  const [blob, setBlob] = useState<Blob>();

  const fire = async () => {
    setLoading(true);
    try {
      const response = await authFetch(
        `/datasets/${dataset.id}/download`,
        {},
        false
      );
      if (!response.ok) throw Error();
      // If silently downloading, return the blob (e.g., for preview)
      if (silent) {
        setBlob(await response.blob());
      } else {
        // Otherwise, download in user’s browser
        downloadBlob(await response.blob(), dataset.fileName);
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, blob, error, fire };
};
