import { Image } from 'expo-image';
import type { ImageStyle, StyleProp } from 'react-native';

import horizontal from '../../assets/images/brand/logo-completo-horizontal.png';
import mascot from '../../assets/images/brand/logo-mascota.png';

const HORIZONTAL_RATIO = 463 / 207;
const MASCOT_RATIO = 350 / 348;

type BrandLogoProps = {
  variant?: 'horizontal' | 'mascot';
  width: number;
  style?: StyleProp<ImageStyle>;
};

/**
 * Logos de la marca. El horizontal incluye el nombre; la mascota se usa sola
 * en estados vacíos y confirmaciones. Siempre se escala manteniendo proporción.
 */
export function BrandLogo({ variant = 'horizontal', width, style }: BrandLogoProps) {
  const height = width / (variant === 'horizontal' ? HORIZONTAL_RATIO : MASCOT_RATIO);

  return (
    <Image
      source={variant === 'horizontal' ? horizontal : mascot}
      contentFit="contain"
      accessibilityRole="image"
      accessibilityLabel="Sabores del Litoral"
      style={[{ width, height }, style]}
    />
  );
}
