import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

import {
  type HardwareVariant,
  useHardwareVariant,
  useSetHardwareVariant,
} from "../../../stores/ui-store.ts";

export interface VariantSwitcherProps {
  sx?: SxProps<Theme>;
}

export function VariantSwitcher({ sx }: VariantSwitcherProps) {
  const hardwareVariant = useHardwareVariant();
  const setHardwareVariant = useSetHardwareVariant();

  return (
    <ToggleButtonGroup
      value={hardwareVariant}
      exclusive
      size="small"
      aria-label="筐体バリアント"
      sx={sx}
      onChange={(_, value: HardwareVariant | null) => {
        if (value !== null) {
          setHardwareVariant(value);
        }
      }}
    >
      <ToggleButton value="original" aria-label="オリジナル版">
        Original
      </ToggleButton>
      <ToggleButton value="new" aria-label="新版">
        New
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
