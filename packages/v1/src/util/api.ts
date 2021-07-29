import { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import config from "../config";

// useAuthFetch is intended for mutations, or queries that need to load on demand/in a specific callback

// useApi is intended for queries that are needed to display data on the page, and for automatically re-fetching when parameters change. usApi can also cache responses and return stale data while fetching.

// Basic cache implementation
const cacheLimit = 100;
const cache: Map<string, any> = new Map();
const getCachedResponse = (url: string) => {
  return cache.get(url);
};
const setCachedResponse = (url: string, response: any) => {
  // If cache gets too big, clear it out
  // TODO improve this (or use an existing solution)
  if (cache.size > cacheLimit) cache.clear();
  cache.set(url, response);
};

const apiBase = config.apiBase;

// This returns a fetch function that will include the auth0 token, and can be used like normal fetch.
// It just needs to be in a hook to access the auth0 context, since the access token is only stored in memory
// It adds some additional error handling. If the response has success: false, then the message from the response will be thrown as an error
export const useAuthFetch = (): ((
  url: string,
  options: RequestInit,
  isJson?: boolean
) => Promise<any>) => {
  const { getAccessTokenSilently } = useAuth0();

  const authFetch = async (
    url: string,
    { headers, ...options }: RequestInit = {},
    isJson?: boolean
  ) => {
    let token;
    try {
      token = await getAccessTokenSilently();
    } catch (error) {
      console.error("Failed to get token", error);
    }

    let requestHeaders;
    requestHeaders = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      // Spread user-defined headers *after* to allow overrides
      ...headers,
    };

    // Allow not setting content-type (needed for multipart form uploads or downloads)
    if (isJson === false) {
      requestHeaders = {
        Authorization: `Bearer ${token}`,
        // Spread user-defined headers *after* to allow overrides
        ...headers,
      };
    }

    const fetchOptions = {
      ...options,
      headers: requestHeaders,
    };
    const response = await fetch(`${apiBase}${url}`, fetchOptions);
    if (isJson === false) {
      return response;
    }
    const json = await response.json();
    if (!json.success) {
      throw json.message;
    } else {
      return json;
    }
  };

  return authFetch;
};

interface IApiHookResponse {
  loading: boolean;
  data: any;
  error: any;
  fire: () => void;
}

export const useApi = (
  url: string,
  // Need to destructure to avoid firing on every render
  { body, method, headers }: RequestInit = {},
  autoLoad = true,
  staleWhileRefetch = true
): IApiHookResponse => {
  const [shouldLoad, setShouldLoad] = useState<boolean>(autoLoad);
  const [loading, setLoading] = useState<boolean>(autoLoad);
  const [responseJson, setResponseJson] = useState<Object | null>(null);
  const [error, setError] = useState(null);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const callApi = async () => {
      try {
        // Set stale data while refetching
        const shouldCache =
          staleWhileRefetch && (method === "GET" || method === undefined);
        if (shouldCache) {
          setResponseJson(getCachedResponse(url));
        }
        setShouldLoad(false);
        setLoading(true);
        let token;
        try {
          token = await getAccessTokenSilently();
        } catch (error) {
          console.error("Failed to get token", error);
        }
        const fetchOptions = {
          body,
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
            // Spread user-defined headers *after* to allow overrides
            ...headers,
          },
        };
        const response = await fetch(`${apiBase}${url}`, fetchOptions);
        const json = await response.json();
        if (!json.success) {
          setError(json.message);
        } else {
          setResponseJson(json);
          if (shouldCache) {
            setCachedResponse(url, json);
          }
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    if (shouldLoad) {
      callApi();
    }
  }, [
    body,
    method,
    url,
    headers,
    shouldLoad,
    getAccessTokenSilently,
    staleWhileRefetch,
  ]);

  // Reload if the URL changes
  useEffect(() => {
    if (autoLoad) setShouldLoad(true);
  }, [url, autoLoad]);

  const fire = useCallback(() => {
    setShouldLoad(false);
    setShouldLoad(true);
  }, []);

  return { loading, data: responseJson, error, fire };
};
