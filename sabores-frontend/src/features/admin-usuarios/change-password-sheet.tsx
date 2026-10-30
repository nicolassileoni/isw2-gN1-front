import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppText, BottomSheet, Button, TextField } from '@/components/ui';
import { palette, radii, semantic, spacing } from '@/constants/theme';
import { useSession } from '@/features/session/session-context';
import { apiClient, ApiHttpError } from '@/lib/api/client';
import { apiRoutes } from '@/lib/api/routes';
import type { UsuarioResponse } from '@/lib/api/types';

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 60;

type PasswordErrors = {
  password?: string;
  confirmacion?: string;
};

function mensajeDeError(error: unknown): string {
  if (error instanceof ApiHttpError) {
    if (error.status === 404) return 'No encontramos ese usuario.';
    return error.message || 'No pudimos cambiar la contraseña. Intentá de nuevo.';
  }

  return error instanceof Error
    ? error.message
    : 'No pudimos cambiar la contraseña. Intentá de nuevo.';
}

type ChangePasswordSheetProps = {
  user: UsuarioResponse;
  onClose: () => void;
  onSaved: () => void;
};

export function ChangePasswordSheet({ user, onClose, onSaved }: ChangePasswordSheetProps) {
  const { user: sesion } = useSession();
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const esPropio = sesion?.id === user.id;

  const guardar = async () => {
    if (guardando) return;

    const siguientes: PasswordErrors = {};

    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
      siguientes.password = `La contraseña debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres.`;
    }

    if (confirmacion !== password) {
      siguientes.confirmacion = 'Las contraseñas no coinciden.';
    }

    setErrors(siguientes);
    setSubmitError(null);
    if (Object.keys(siguientes).length > 0) return;

    setGuardando(true);
    try {
      await apiClient.patch(apiRoutes.usuarios.password(user.id), { password });
      Alert.alert(
        'Contraseña actualizada',
        esPropio
          ? 'Usá la nueva contraseña la próxima vez que inicies sesión.'
          : `${user.nombreCompleto} deberá usar la nueva contraseña para ingresar.`,
      );
      onSaved();
    } catch (error: unknown) {
      setSubmitError(mensajeDeError(error));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <BottomSheet visible onClose={onClose} title="Cambiar contraseña">
      <View style={styles.content}>
        <AppText variant="body" color={palette.warmGray}>
          Nueva contraseña para <AppText variant="label">{user.nombreCompleto}</AppText>.
        </AppText>

        <TextField
          label="Nueva contraseña"
          required
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setErrors((current) => ({ ...current, password: undefined }));
            setSubmitError(null);
          }}
          placeholder="Mínimo 8 caracteres"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={PASSWORD_MAX}
          editable={!guardando}
          error={errors.password}
          helper={`Entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres.`}
        />

        <TextField
          label="Repetir contraseña"
          required
          value={confirmacion}
          onChangeText={(value) => {
            setConfirmacion(value);
            setErrors((current) => ({ ...current, confirmacion: undefined }));
            setSubmitError(null);
          }}
          placeholder="Repetí la nueva contraseña"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={PASSWORD_MAX}
          editable={!guardando}
          error={errors.confirmacion}
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
          title="Guardar contraseña"
          onPress={() => void guardar()}
          loading={guardando}
          fullWidth
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.input,
    backgroundColor: semantic.dangerSoft,
  },
  errorText: {
    flex: 1,
  },
});
