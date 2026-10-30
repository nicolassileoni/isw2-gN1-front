import { Alert, StyleSheet, View } from 'react-native';

import { AppText, BottomSheet, Button, Divider, IconButton, MoneyText, QuantityStepper } from '@/components/ui';
import { palette, spacing } from '@/constants/theme';

import { useCart } from './cart-context';

type CartSheetProps = { visible: boolean; onClose: () => void };

export function CartSheet({ visible, onClose }: CartSheetProps) {
  const { local, items, totals, setQuantity, removeProduct, clearCart } = useCart();
  const clearWithConfirmation = () => {
    Alert.alert('¿Vaciar el pedido?', 'Se eliminarán todos los productos del carrito.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Vaciar', style: 'destructive', onPress: () => { clearCart(); onClose(); } },
    ]);
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Tu pedido"
      footer={
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <AppText variant="h3">Total estimado</AppText>
            <MoneyText amount={totals.total} variant="h3" />
          </View>
          <Button title="Continuar" disabled fullWidth />
        </View>
      }>
      <View style={styles.content}>
        {local ? <AppText variant="caption" color={palette.warmGray}>Pedido en {local.nombre}</AppText> : null}
        {items.map((item) => (
          <View key={item.productoId} style={styles.item}>
            <View style={styles.itemCopy}>
              <AppText variant="label">{item.nombre}</AppText>
              <MoneyText amount={item.precio} variant="caption" color={palette.warmGray} />
            </View>
            <QuantityStepper
              value={item.cantidad}
              max={item.stock}
              label={`Cantidad de ${item.nombre}`}
              onChange={(cantidad) => setQuantity(item.productoId, cantidad)}
            />
            <IconButton
              name="trash-outline"
              label={`Quitar ${item.nombre}`}
              color={palette.danger}
              onPress={() => removeProduct(item.productoId)}
            />
          </View>
        ))}
        <Button title="Vaciar pedido" variant="destructive" onPress={clearWithConfirmation} />
        <Divider />
        <View style={styles.summaryRow}><AppText variant="body">Subtotal</AppText><MoneyText amount={totals.subtotal} variant="body" /></View>
        <View style={styles.summaryRow}><AppText variant="body">Descuento</AppText><MoneyText amount={-totals.descuento} variant="body" /></View>
        <View style={styles.summaryRow}><AppText variant="body">Envío</AppText><MoneyText amount={totals.envio} variant="body" /></View>
        <AppText variant="caption" color={palette.warmGray}>El total final lo calcula el backend al confirmar el pedido.</AppText>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  itemCopy: { flex: 1, gap: spacing.xs },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  footer: { gap: spacing.md },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
});
