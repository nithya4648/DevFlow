// src/hooks/useDebounce.js
import { useState, useEffect } from "react";

/**
 * Returns a debounced version of value that only updates after `delay` ms of inactivity.
 */
export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
