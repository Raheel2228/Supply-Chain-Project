import { useState } from "react";

const memoryState: Record<string, any> = {};

/**
 * Simple in-memory state persistence, with some caveats.
 * State will persist across component mounts, and cleared on page refresh.
 * This should only be used in singleton-like components (only one is mounted at a time).
 * @param key unique key for state value
 * @param initialState value or function that returns initial value
 */
export default function useMemoryState<S>(
  key: string,
  initialState: S | (() => S)
): [S, (newState: S) => void] {
  const [state, setState] = useState<S>(() => {
    const hasMemoryValue = Object.prototype.hasOwnProperty.call(
      memoryState,
      key
    );
    if (hasMemoryValue) {
      return memoryState[key] as S;
    } else if (typeof initialState === "function") {
      return (initialState as () => S)();
    } else {
      return initialState;
    }
  });

  function onChange(nextState: S) {
    memoryState[key] = nextState;
    setState(nextState);
  }

  return [state, onChange];
}
