import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { AppText, Button, Card, EmptyState, ErrorState, MoneyText, Screen, TextField } from '@/components/ui';
import { palette, spacing } from '@/constants/theme';
import { useCart } from '@/features/cart/cart-context';
import { apiClient, ApiHttpError } from '@/lib/api/client';
import { apiRoutes } from '@/lib/api/routes';
import type { CrearPedidoRequest, PedidoCreadoResponse } from '@/lib/api/types';

type FormErrors = { nombre?: string; telefono?: string; direccion?: string };

function validateForm(nombre: string, telefono: string, direccion: string): FormErrors {
  const errors: FormErrors = {};
  if (!nombre.trim()) errors.nombre = 'Ingresá tu nombre.';
  else if (nombre.trim().length > 80) errors.nombre = 'El nombre puede tener hasta 80 caracteres.';
  if (!/^\d{8,15}$/.test(telefono)) errors.telefono = 'Ingresá entre 8 y 15 dígitos.';
  if (!direccion.trim()) errors.direccion = 'Ingresá la dirección de entrega.';
  else if (direccion.trim().length > 150) errors.direccion = 'La dirección puede tener hasta 150 caracteres.';
  return errors;
}

export default function CheckoutScreen() {
  const { local, items, cantidadTotal, totals, clearCart } = useCart();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const nombreRef = useRef<TextInput>(null);
  const telefonoRef = useRef<TextInput>(null);
  const direccionRef = useRef<TextInput>(null);

  const submit = async () => {
    const nextErrors = validateForm(nombre, telefono, direccion);
    setErrors(nextErrors);
    setSubmitError(null);
    if (nextErrors.nombre) {
      nombreRef.current?.focus();
      return;
    }
    if (nextErrors.telefono) {
      telefonoRef.current?.focus();
      return;
    }
    if (nextErrors.direccion) {
      direccionRef.current?.focus();
      return;
    }
    if (!local || items.length === 0 || submitting) return;

    const request: CrearPedidoRequest = {
      localId: local.id,
      direccionEntrega: direccion.trim(),
      cliente: { nombre: nombre.trim(), telefono },
      items: items.map((item) => ({ productoId: item.productoId, cantidad: item.cantidad })),
    };

    setSubmitting(true);
    try {
      const response = await apiClient.post<PedidoCreadoResponse>(apiRoutes.pedidos.create, request);
      clearCart();
      router.replace({
        pathname: '/confirmacion',
        params: {
          codigo: response.codigoSeguimiento,
          total: String(response.total),
          estado: response.estado,
          fechaHora: response.fechaHora,
          local: local.nombre,
        },
      });
    } catch (error: unknown) {
      if (error instanceof ApiHttpError) {
        setSubmitError(error.message);
      } else {
        setSubmitError('No pudimos confirmar el pedido. Revisá tu conexión e intentá nuevamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!local || items.length === 0) {
    return (
      <Screen scroll contentContainerStyle={styles.screen}>
        <EmptyState
          icon="bag-outline"
          title="Tu pedido está vacío"
          description="Agregá productos de un local para continuar con la confirmación."
          actionLabel="Ver locales"
          onAction={() => router.replace('/')}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll contentContainerStyle={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.content}>
        <View style={styles.header}>
          <AppText variant="overline" color={palette.warmGray}>ÚLTIMO PASO</AppText>
          <AppText variant="h1">Confirmá tu pedido</AppText>
          <AppText variant="body" color={palette.pewter}>No necesitás crear una cuenta. Guardá el código para seguir tu pedido.</AppText>
        </View>

        <Card style={styles.summary}>
          <AppText variant="label">{local.nombre}</AppText>
          <AppText variant="body" color={palette.warmGray}>{cantidadTotal} {cantidadTotal === 1 ? 'producto' : 'productos'}</AppText>
          <View style={styles.totalRow}><AppText variant="label">Total estimado</AppText><MoneyText amount={totals.total} /></View>
        </Card>

        <Card style={styles.form}>
          <TextField
            ref={nombreRef}
            label="Nombre"
            required
            value={nombre}
            onChangeText={(value) => { setNombre(value); setErrors((current) => ({ ...current, nombre: undefined })); }}
            placeholder="Tu nombre"
            maxLength={80}
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="next"
            onSubmitEditing={() => telefonoRef.current?.focus()}
            error={errors.nombre}
          />
          <TextField
            ref={telefonoRef}
            label="Teléfono"
            required
            value={telefono}
            onChangeText={(value) => { setTelefono(value.replace(/\D/g, '')); setErrors((current) => ({ ...current, telefono: undefined })); }}
            placeholder="3425000000"
            keyboardType="phone-pad"
            maxLength={15}
            autoComplete="tel"
            returnKeyType="next"
            onSubmitEditing={() => direccionRef.current?.focus()}
            error={errors.telefono}
            helper="Solo números, entre 8 y 15 dígitos."
          />
          <TextField
            ref={direccionRef}
            label="Dirección de entrega"
            required
            value={direccion}
            onChangeText={(value) => { setDireccion(value); setErrors((current) => ({ ...current, direccion: undefined })); }}
            placeholder="Calle, número y referencias"
            maxLength={150}
            autoComplete="street-address"
            multiline
            numberOfLines={3}
            returnKeyType="done"
            onSubmitEditing={submit}
            error={errors.direccion}
          />
          {submitError ? <ErrorState title="No se pudo confirmar" message={submitError} /> : null}
          <Button title="Confirmar pedido" fullWidth loading={submitting} onPress={submit} />
        </Card>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xxl },
  content: { gap: spacing.xxl },
  header: { gap: spacing.sm },
  summary: { gap: spacing.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  form: { gap: spacing.lg },
});
