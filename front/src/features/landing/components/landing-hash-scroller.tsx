"use client";

import { useEffect } from "react";

const landingSectionIds = new Set(["intro", "features", "pricing"]);

function scrollToCurrentHash(behavior: ScrollBehavior) {
  const sectionId = window.location.hash.replace("#", "");

  if (!landingSectionIds.has(sectionId)) {
    return;
  }

  const target = document.getElementById(sectionId);

  if (!target) {
    return;
  }

  target.scrollIntoView({ behavior, block: "start" });
}

export function LandingHashScroller() {
  useEffect(() => {
    const timeoutIds = new Set<number>();

    function scheduleHashScroll(behavior: ScrollBehavior) {
      window.requestAnimationFrame(() => scrollToCurrentHash(behavior));

      const timeoutId = window.setTimeout(() => {
        scrollToCurrentHash("auto");
        timeoutIds.delete(timeoutId);
      }, 80);

      timeoutIds.add(timeoutId);
    }

    scheduleHashScroll("auto");

    function handleHashChange() {
      scheduleHashScroll("smooth");
    }

    function handleHistoryRestore() {
      scheduleHashScroll("auto");
    }

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("popstate", handleHistoryRestore);
    window.addEventListener("pageshow", handleHistoryRestore);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", handleHistoryRestore);
      window.removeEventListener("pageshow", handleHistoryRestore);
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  return null;
}
