import { useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash.debounce";
import useGetJsas from "@/app/requests/useGetJsas";

const PAGE_SIZE = 8;

const useJsaList = () => {
  const { getJsas } = useGetJsas();

  const [query, setQuery] = useState("");
  const [jsas, setJsas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [searching, setSearching] = useState(false);
  const [total, setTotal] = useState(0);

  const pageRef = useRef(1);
  const totalPagesRef = useRef(1);
  const latestSearchRef = useRef("");
  const mountedRef = useRef(true);

  const loadFirstPage = async (searchTerm = "", showMainLoader = false) => {
    const normalizedSearch = searchTerm.trim();
    latestSearchRef.current = normalizedSearch;

    if (showMainLoader) {
      setLoading(true);
    } else {
      setSearching(true);
    }

    const data = await getJsas(1, PAGE_SIZE, normalizedSearch || undefined);

    if (!mountedRef.current) return;
    if (latestSearchRef.current !== normalizedSearch) return;

    if (data) {
      setJsas(data.data ?? []);
      setTotal(data.pagination?.total ?? 0);
      pageRef.current = data.pagination?.page ?? 1;
      totalPagesRef.current = data.pagination?.totalPages ?? 1;
    } else {
      setJsas([]);
      setTotal(0);
      pageRef.current = 1;
      totalPagesRef.current = 1;
    }

    setLoading(false);
    setSearching(false);
  };

  const getMoreData = async () => {
    if (loading || searching || fetchingMore) return;
    if (pageRef.current >= totalPagesRef.current) return;

    const searchTerm = latestSearchRef.current;
    const nextPage = pageRef.current + 1;

    try {
      setFetchingMore(true);

      const data = await getJsas(nextPage, PAGE_SIZE, searchTerm || undefined);

      if (!mountedRef.current) return;
      if (latestSearchRef.current !== searchTerm) return;

      if (data) {
        const incoming = data.data ?? [];

        setJsas((prev) => {
          const seen = new Set(
            prev.map((item) => item?._id?.toString?.()).filter(Boolean),
          );

          const deduped = incoming.filter((item: any) => {
            const id = item?._id?.toString?.();
            if (!id) return true;
            return !seen.has(id);
          });

          return [...prev, ...deduped];
        });

        setTotal(data.pagination?.total ?? total);
        pageRef.current = data.pagination?.page ?? nextPage;
        totalPagesRef.current =
          data.pagination?.totalPages ?? totalPagesRef.current;
      }
    } finally {
      if (mountedRef.current) {
        setFetchingMore(false);
      }
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce(async (value: string) => {
        await loadFirstPage(value, false);
      }, 300),
    [getJsas],
  );

  const handleSearchChange = async (value: string) => {
    setQuery(value);

    if (!value.trim()) {
      debouncedSearch.cancel();
      await loadFirstPage("", false);
      return;
    }

    debouncedSearch(value);
  };

  useEffect(() => {
    mountedRef.current = true;
    loadFirstPage("", true);

    return () => {
      mountedRef.current = false;
      debouncedSearch.cancel();
    };
  }, []);

  return {
    query,
    jsas,
    loading,
    searching,
    fetchingMore,
    total,
    handleSearchChange,
    getMoreData,
  };
};

export default useJsaList;
