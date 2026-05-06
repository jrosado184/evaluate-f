import { useCallback, useState } from "react";

const useBottomSheetFlow = <TView extends string, TData = any>(
  initialView: TView,
) => {
  const [view, setView] = useState<TView>(initialView);
  const [data, setData] = useState<TData | null>(null);

  const open = useCallback(
    (payload?: TData | null, nextView?: TView) => {
      setData(payload ?? null);
      setView(nextView ?? initialView);
    },
    [initialView],
  );

  const reset = useCallback(() => {
    setData(null);
    setView(initialView);
  }, [initialView]);

  return {
    view,
    setView,
    data,
    setData,
    open,
    reset,
  };
};

export default useBottomSheetFlow;
