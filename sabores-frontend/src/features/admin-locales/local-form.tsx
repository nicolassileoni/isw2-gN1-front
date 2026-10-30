import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View, type TextInputInstance } from 'react-native';

import { AppText, Button, Card, TextField } from '@/components/ui';
import { palette, radii, semantic, spacing } from '@/constants/theme';
import { apiClient, ApiHttpError } from '@/lib/api/client';
import { apiRoutes } from '@/lib/api/routes';
import type { LocalAdminResponse, LocalUpsertRequest } from '@/lib/api/types';

const NOMBRE_MAX = 80;
const DIRECCION_MAX = 120;
const TELEFONO_MAX = 15;

type Campo = 'nombre' | 'direccion' | 'telefono';
type FormErrors = Partial<Record<Campo, string>>;

function validar(campo: Campo, valor: string): string | undefined {
  const texto = valor.trim();

  if (campo === 'nombre') {
    if (!texto) return 'Ingresá el nombre del local.';
    if (texto.length > NOMBRE_MAX) return `El nombre puede tener hasta ${NOMBRE_MAX} caracteres.`;
  }

  if (campo === 'direccion' && texto.length > DIRECCION_MAX) {
    return `La dirección puede tener hasta ${DIRECCION_MAX} caracteres.`;
  }

  if (campo === 'telefono' && texto.length > TELEFONO_MAX) {
    return `El teléfono puede tener hasta ${TELEFONO_MAX} dígitos.`;
  }

  return undefined;
}

function mensajeDeError(error: unknown): string {
  if (error instanceof ApiHttpError) {
    if (error.status === 409) return 'Ya existe un local con ese nombre.';
    return error.message || 'No pudimos guardar el local. Intentá de nuevo.';
  }

  return error instanceof Error ? error.message : 'No pudimos guardar el local. Intentá de nuevo.';
}

type LocalFormProps = {
  /** `null` = alta. Con valor = edición. */
  local: LocalAdminResponse | null;
  onSaved: () => void;
};

export function LocalForm({ local, onSaved }: LocalFormProps) {
  const [nombre, setNombre] = useState(local?.nombre ?? '');
  const [direccion, setDireccion] = useState(local?.direccion ?? '');
  const [telefono, setTelefono] = useState(local?.telefono ?? '');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const nombreRef = useRef<TextInputInstance>(null);
  const direccionRef = useRef<TextInputInstance>(null);
  const telefonoRef = useRef<TextInputInstance>(null);

  const actualizar = (campo: Campo, valor: string) => {
    if (campo === 'nombre') setNombre(valor);
    if (campo === 'direccion') setDireccion(valor);
    if (campo === 'telefono') setTelefono(valor.replace(/\D/g, ''));
    setErrors((current) => ({ ...current, [campo]: undefined }));
    setSubmitError(null);
  };

  const validarAlSalir = (campo: Campo) => {
    const valor = campo === 'nombre' ? nombre : campo === 'direccion' ? direccion : telefono;
    setErrors((current) => ({ ...current, [campo]: validar(campo, valor) }));
  };

  const guardar = async () => {
    if (guardando) return;

    const siguientes: FormErrors = {
      nombre: validar('nombre', nombre),
      direccion: validar('direccion', direccion),
      telefono: validar('telefono', telefono),
    };
    setErrors(siguientes);

    if (siguientes.nombre) {
      nombreRef.current?.focus();
      return;
    }
    if (siguientes.direccion) {
      direccionRef.current?.focus();
      return;
    }
    if (siguientes.telefono) {
      telefonoRef.current?.focus();
      return;
    }

    const body: LocalUpsertRequest = {
      nombre: nombre.trim(),
      direccion: direccion.trim() || null,
      telefono: telefono.trim() || null,
    };

    setGuardando(true);
    setSubmitError(null);

    try {
      if (local) {
        await apiClient.put(apiRoutes.locales.detail(local.id), body);
      } else {
        await apiClient.post(apiRoutes.locales.list, body);
      }
      onSaved();
    } catch (error: unknown) {
      setSubmitError(mensajeDeError(error));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <Card style={styles.card}>
        <AppText variant="overline" color={palette.warmGray}>
          {local ? 'EDITAR LOCAL' : 'NUEVO LOCAL'}
        </AppText>

        <TextField
          ref={nombreRef}
          label="Nombre"
          required
          value={nombre}
          onChangeText={(value) => actualizar('nombre', value)}
          onBlur={() => validarAlSalir('nombre')}
          placeholder="Ej.: Sabores del Puerto"
          maxLength={NOMBRE_MAX}
          autoCapitalize="words"
          returnKeyType="next"
          onSubmitEditing={() => direccionRef.current?.focus()}
          editable={!guardando}
          error={errors.nombre}
        />

        <TextField
          ref={direccionRef}
          label="Dirección"
          value={direccion}
          onChangeText={(value) => actualizar('direccion', value)}
          onBlur={() => validarAlSalir('direccion')}
          placeholder="Calle y número"
          maxLength={DIRECCION_MAX}
          autoCapitalize="sentences"
          returnKeyType="next"
          onSubmitEditing={() => telefonoRef.current?.focus()}
          editable={!guardando}
          error={errors.direccion}
          helper={`Opcional. Hasta ${DIRECCION_MAX} caracteres.`}
        />

        <TextField
          ref={telefonoRef}
          label="Teléfono"
          value={telefono}
          onChangeText={(value) => actualizar('telefono', value)}
          onBlur={() => validarAlSalir('telefono')}
          placeholder="3425000000"
          maxLength={TELEFONO_MAX}
          keyboardType="phone-pad"
          autoComplete="tel"
          returnKeyType="done"
          onSubmitEditing={() => void guardar()}
          editable={!guardando}
          error={errors.telefono}
          helper={`Opcional. Solo números, hasta ${TELEFONO_MAX} dígitos.`}
        />

        {submitError ? (
          <View style={styles.errorBox} accessibilityLiveRegion="polite">
            <Ionicons name="alert-circle" size={18} color={palette.danger} />
            <AppText variant="caption" color={palette.danger} style={styles.errorText}>
              {submitError}
            </AppText>
          </View>
        ) : null}

        <Button
          title={local ? 'Guardar cambios' : 'Crear local'}
          onPress={() => void guardar()}
          loading={guardando}
          fullWidth
        />
      </Card>

      <AppText variant="caption" color={palette.warmGray} style={styles.note}>
        Los locales no se eliminan: se desactivan desde el catálogo.
      </AppText>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg },
  card: { gap: spacing.lg },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.input,
    backgroundColor: semantic.dangerSoft,
  },
  errorText: { flex: 1 },
  note: { textAlign: 'center' },
});
