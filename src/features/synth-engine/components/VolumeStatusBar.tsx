import MicIcon from "@mui/icons-material/Mic";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { Box, LinearProgress, Typography } from "@mui/material";
import { type KeyboardEvent, type ReactNode, useCallback } from "react";

import { useIsAudioInitialized } from "../../../stores/audio-store.ts";
import { useConfigAudio } from "../../../stores/config-store.ts";
import { type ConfigPanelSectionId, useOpenConfigPanelSection } from "../../../stores/ui-store.ts";
import { getInputPeakBarColor, useInputPeakLevel } from "../hooks/useInputPeakLevel.ts";

interface VolumeStatusItemProps {
  description: string;
  ariaLabel: string;
  sectionId: ConfigPanelSectionId;
  onOpenSection: (sectionId: ConfigPanelSectionId) => void;
  children: ReactNode;
}

function VolumeStatusItem({
  description,
  ariaLabel,
  sectionId,
  onOpenSection,
  children,
}: VolumeStatusItemProps) {
  const handleClick = useCallback(() => {
    onOpenSection(sectionId);
  }, [onOpenSection, sectionId]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onOpenSection(sectionId);
      }
    },
    [onOpenSection, sectionId],
  );

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.25,
        px: 1,
        py: 0.5,
        borderRadius: 1,
        border: 1,
        borderColor: "divider",
        bgcolor: "rgba(255,255,255,0.04)",
        cursor: "pointer",
        "&:hover": { bgcolor: "action.hover" },
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>{children}</Box>
      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
        {description}
      </Typography>
    </Box>
  );
}

export function VolumeStatusBar() {
  const isInitialized = useIsAudioInitialized();
  const audio = useConfigAudio();
  const openConfigPanelSection = useOpenConfigPanelSection();
  const peakLevel = useInputPeakLevel();

  if (!isInitialized) {
    return null;
  }

  const inputPercent = Math.min(peakLevel * 100, 100);
  const inputBarColor = getInputPeakBarColor(peakLevel);

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, flexWrap: "wrap" }}>
      <VolumeStatusItem
        description="マイク入力の音量です。クリックで入力設定を開きます。"
        ariaLabel="マイク入力設定を開く"
        sectionId="mic-input"
        onOpenSection={openConfigPanelSection}
      >
        <MicIcon sx={{ fontSize: 18, color: "text.secondary" }} />
        <Typography variant="caption" color="text.secondary">
          入力
        </Typography>
        <LinearProgress
          variant="determinate"
          value={inputPercent}
          color={inputBarColor}
          aria-hidden
          sx={{ width: 72, height: 6, borderRadius: 1 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 28 }}>
          {inputPercent.toFixed(0)}%
        </Typography>
      </VolumeStatusItem>

      <VolumeStatusItem
        description="再生出力の音量（0-1）です。クリックで入力設定を開きます。"
        ariaLabel="音量設定を開く"
        sectionId="audio"
        onOpenSection={openConfigPanelSection}
      >
        <VolumeUpIcon sx={{ fontSize: 18, color: "text.secondary" }} />
        <Typography variant="caption" color="text.secondary">
          音量（アテニュエーション） {audio.attenuation.toFixed(3)}
        </Typography>
      </VolumeStatusItem>
    </Box>
  );
}
