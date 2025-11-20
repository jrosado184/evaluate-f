// hooks/useSelect.ts
// @ts-nocheck
import { useCallback, useEffect, useRef, useState } from "react";

const useSelect = (
  loadData?: any,
  toggleModal?: (open: boolean) => void,
  onSelect?: (opt: any) => void
) => {
  const [options, setOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1); // server-ack page
  const [totalPages, setTotalPages] = useState(1);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inFlightRef = useRef(false); // blocks duplicate fetches

  const hasMore = page < totalPages;

  // Build a stable key for each item once (prevents key changes)
  const ensureStableIds = (items: any[]) =>
    items.map((it) => ({
      ...it,
      __k:
        it.id ??
        it.value ??
        `${it.label}|${it?.children?.dept_code ?? ""}|${
          it?.children?.matching_task_codes?.[0] ?? ""
        }`,
    }));

  const fetchPage = useCallback(
    async ({
      reset = false,
      pageOverride,
    }: { reset?: boolean; pageOverride?: number } = {}) => {
      if (!loadData) return;
      if (inFlightRef.current) return; // guard
      inFlightRef.current = true;
      setIsLoading(true);
      setError(null);

      // cancel any in-flight request
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const nextPage = reset ? 1 : pageOverride ?? page;

        const payload = await loadData({
          query,
          page: nextPage,
          signal: ac.signal,
        });

        const normalized = ensureStableIds(payload.results || []);

        if (reset) {
          setOptions(normalized);
        } else {
          setOptions((prev) => [...prev, ...normalized]);
        }

        setPage(payload.currentPage || nextPage);
        setTotalPages(payload.totalPages || 1);
      } catch (e: any) {
        if (e.name !== "AbortError" && e.name !== "CanceledError") {
          setError(e?.message || "Failed to load options");
        }
      } finally {
        inFlightRef.current = false;
        setIsLoading(false);
      }
    },
    [loadData, page, query]
  );

  const open = useCallback(() => {
    setShowActionSheet(true);
    toggleModal?.(true);
    if (!options.length) {
      fetchPage({ reset: true, pageOverride: 1 });
    }
  }, [options.length, fetchPage, toggleModal]);

  const select = useCallback(
    (opt: any) => {
      onSelect?.(opt);
      setShowActionSheet(false);
      toggleModal?.(false);
    },
    [onSelect, toggleModal]
  );

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    fetchPage({ reset: false, pageOverride: page + 1 });
  }, [isLoading, hasMore, page, fetchPage]);

  const setSearch = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setPage(1);
        fetchPage({ reset: true, pageOverride: 1 });
      }, 350);
    },
    [fetchPage]
  );

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    options,
    isLoading,
    error,
    showActionSheet,
    setShowActionSheet,
    handlePress: open,
    handleSelect: select,

    // pagination + search
    loadMore,
    hasMore,
    query,
    setSearch,
  };
};

export default useSelect;
