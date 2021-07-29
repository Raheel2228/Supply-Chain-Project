// From https://reacttraining.com/react-router/web/guides/scroll-restoration
import { useEffect } from "react";

export default function ScrollToTopOnMount() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return null;
}
