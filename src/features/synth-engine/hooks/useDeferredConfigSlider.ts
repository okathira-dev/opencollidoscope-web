import { useCallback } from "react";

import { useApplyConfig, usePersistConfig } from "../../../stores/config-store.ts";

/** Slider 用: onChange でメモリ反映、onChangeCommitted で localStorage 永続化。 */
export function useDeferredConfigSlider() {
  const applyConfig = useApplyConfig();
  const persistConfig = usePersistConfig();
  const commitConfig = useCallback(() => {
    persistConfig();
  }, [persistConfig]);

  return { applyConfig, commitConfig };
}
