import { AppText } from '@/components/ui/app-text';
import { palette, type TypographyVariant } from '@/constants/theme';
import { formatMoney } from '@/lib/format';

type MoneyTextProps = {
  amount: number | string;
  variant?: TypographyVariant;
  color?: string;
};

export function MoneyText({ amount, variant = 'price', color = palette.ink }: MoneyTextProps) {
  return (
    <AppText variant={variant} color={color} style={{ fontVariant: ['tabular-nums'] }}>
      {formatMoney(amount)}
    </AppText>
  );
}
