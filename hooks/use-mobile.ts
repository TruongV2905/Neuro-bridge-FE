import * as React from "react"

const MOBILE_BREAKPOINT = 768
const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribeToMobileChange(onStoreChange: () => void) {
  const mediaQueryList = window.matchMedia(MOBILE_MEDIA_QUERY)

  mediaQueryList.addEventListener("change", onStoreChange)

  return () => mediaQueryList.removeEventListener("change", onStoreChange)
}

function getMobileSnapshot() {
  if (typeof window === "undefined") {
    return false
  }

  return window.matchMedia(MOBILE_MEDIA_QUERY).matches
}

function getServerMobileSnapshot() {
  return false
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribeToMobileChange,
    getMobileSnapshot,
    getServerMobileSnapshot,
  )
}
