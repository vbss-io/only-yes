import {
  ArrowUUpLeft,
  BeerStein,
  Confetti,
  Crown,
  Diamond,
  HandsPraying,
  Heart,
  HeartStraight,
  MusicNotes,
  Smiley,
  type Icon,
} from "@phosphor-icons/react";

const ICONS: Record<string, Icon> = {
  heart: Heart,
  diamond: Diamond,
  "hands-praying": HandsPraying,
  beer: BeerStein,
  confetti: Confetti,
  crown: Crown,
  "heart-straight": HeartStraight,
  "music-notes": MusicNotes,
  smiley: Smiley,
  "arrow-u-up-left": ArrowUUpLeft,
};

interface OccasionIconProps {
  name: string;
}

export const OccasionIcon = ({ name }: OccasionIconProps) => {
  const IconComponent = ICONS[name] ?? Heart;
  return <IconComponent />;
};
