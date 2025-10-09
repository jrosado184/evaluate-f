// @ts-nocheck
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Generic hook to open an ActionSheet, lazily load options once, and pass the FULL option back.
 * loadData: () => Promise<Option[]>
 * toggleModal: optional external controller
 * onSelect: (opt) => void
 */
export default function useSelect(
  loadData?: any,
  toggleModal?: any,
  onSelect?: any
) {
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  const ensureLoaded = useCallback(async () => {
    if (loadedRef.current || !loadData) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await loadData();
      setOptions(Array.isArray(data) ? data : []);
      loadedRef.current = true;
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  const handlePress = useCallback(async () => {
    if (toggleModal) toggleModal(true);
    await ensureLoaded();
    setShowActionSheet(true);
  }, [toggleModal, ensureLoaded]);

  const handleSelect = useCallback(
    (opt: any) => {
      if (onSelect) onSelect(opt); // pass the FULL object (keeps children: {dept_name, dept_code, task_code})
      setShowActionSheet(false);
    },
    [onSelect]
  );

  // when an external modal toggle is used, still preload
  useEffect(() => {
    // optional eager preload: uncomment if you want to fetch immediately
    // ensureLoaded();
  }, [ensureLoaded]);

  return {
    handlePress,
    handleSelect,
    showActionSheet,
    setShowActionSheet,
    options,
    isLoading,
    error,
  };
}
