"use client";

import { useSearchParams } from "next/navigation";

function useGetParams() {
  const searchParams = useSearchParams();

  const getParams = (param: string) => {
    return searchParams.get(param);
  };

  return getParams;
}

export default useGetParams;