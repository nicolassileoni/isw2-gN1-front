import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Chip, TextField } from '@/components/ui';
import { palette, radii, semantic, spacing } from '@/constants/theme';
import { ApiHttpError, apiClient } from '@/lib/api/client';
import { apiRoutes } from '@/lib/api/routes';
import type { ActualizarUsuarioRequest, CrearUsuarioRequest, Rol, UsuarioResponse } from '@/lib/api/types';

const USERNAME_MAX = 40;
const NOMBRE_MAX = 100;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 60;

type Campo = 'username' | 'nombreCompleto' | 'password' | 'confirmacion';
type FormErrors = Partial<Record<Campo, string>>;

function mensajeDeError(error: unknown): string {
  if (error instanceof ApiHttpError) {
    if (error.status === 409) return 'Ya existe un usuario con ese nombre de usuario.';
    if (error.status === 404) return 'No encontramos ese usuario.';
    return error.message || 'No pudimos guardar el usuario. Intentá de nuevo.';
  }

  return error instanceof Error
    ? error.message
    : 'No pudimos guardar el usuario. Intentá de nuevo.';
}

type UserFormProps = {
  usuario: UsuarioResponse | null;
  esPropio: boolean;
  onSaved: () => void;
};

export function UserForm({ usuario, esPropio, onSaved }: UserFormProps) {
  const [username, setUsername] = useState(usuario?.username ?? '');
  const [nombreCompleto, setNombreCompleto] = useState(usuario?.nombreCompleto ?? '');
  const [rol, setRol] = useState<Rol>(usuario?.rol ?? 'OPERADOR');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const editando = usuario !== null;
  const puedeCambiarRolPropio = !(esPropio && usuario?.rol === 'ADMIN');

  const limpiarError = (campo: Campo) => {
    setErrors((current) => ({ ...current, [campo]: undefined }));
    setSubmitError(null);
  };

  const guardar = async () => {
    if (guardando) return;

    const siguientes: FormErrors = {};

    if (!username.trim()) siguientes.username = 'Ingresá el nombre de usuario.';
    else if (username.trim().length > USERNAME_MAX) {
      siguientes.username = `El usuario puede tener hasta ${USERNAME_MAX} caracteres.`;
    }

    if (!nombreCompleto.trim()) siguientes.nombreCompleto = 'Ingresá el nombre completo.';
    else if (nombreCompleto.trim().length > NOMBRE_MAX) {
      siguientes.nombreCompleto = `El nombre puede tener hasta ${NOMBRE_MAX} caracteres.`;
    }

    if (!editando) {
      if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
        siguientes.password = `La contraseña debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres.`;
      }

      if (confirmacion !== password) {
        siguientes.confirmacion = 'Las contraseñas no coinciden.';
      }
    }

    if (esPropio && usuario?.rol === 'ADMIN' && rol !== 'ADMIN') {
      setSubmitError('No podés quitarte el rol de administrador.');
      return;
    }

    setErrors(siguientes);
    setSubmitError(null);
    if (Object.keys(siguientes).length > 0) return;

    setGuardando(true);

    try {
      if (usuario) {
        const body: ActualizarUsuarioRequest = {
          nombreCompleto: nombreCompleto.trim(),
          rol,
        };
        await apiClient.put<UsuarioResponse>(apiRoutes.usuarios.detail(usuario.id), body);
      } else {
        const body: CrearUsuarioRequest = {
          username: username.trim(),
          password,
          nombreCompleto: nombreCompleto.trim(),
          rol,
        };
        await apiClient.post<UsuarioResponse>(apiRoutes.usuarios.list, body);
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
          {editando ? 'EDITAR USUARIO' : 'NUEVO USUARIO'}
        </AppText>

        <TextField
          label="Nombre de usuario"
          required
          value={username}
          onChangeText={(value) => {
            setUsername(value);
            limpiarError('username');
          }}
          placeholder="Ej.: operador1"
          maxLength={USERNAME_MAX}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!editando && !guardando}
          error={errors.username}
          helper={
            editando
              ? 'El nombre de usuario no se puede cambiar.'
              : `Debe ser único. Hasta ${USERNAME_MAX} caracteres.`
          }
        />

        <TextField
          label="Nombre completo"
          required
          value={nombreCompleto}
          onChangeText={(value) => {
            setNombreCompleto(value);
            limpiarError('nombreCompleto');
          }}
          placeholder="Nombre y apellido"
          maxLength={NOMBRE_MAX}
          autoCapitalize="words"
          editable={!guardando}
          error={errors.nombreCompleto}
        />

        <View style={styles.roleBlock}>
          <AppText variant="label" color={palette.slate}>
            Rol
          </AppText>
          <View style={styles.roleRow}>
            <Chip
              label="Administrador"
              selected={rol === 'ADMIN'}
              disabled={guardando || !puedeCambiarRolPropio}
              onPress={() => {
                setRol('ADMIN');
                setSubmitError(null);
              }}
            />
            <Chip
              label="Operador"
              selected={rol === 'OPERADOR'}
              disabled={guardando || !puedeCambiarRolPropio}
              onPress={() => {
                setRol('OPERADOR');
                setSubmitError(null);
              }}
            />
          </View>
          <AppText variant="caption" color={palette.warmGray}>
            {rol === 'ADMIN'
              ? 'Acceso total: catálogo, ventas y usuarios.'
              : 'Puede ver y despachar pedidos, pero no administrar el catálogo.'}
          </AppText>
          {!puedeCambiarRolPropio ? (
            <AppText variant="caption" color={palette.warning}>
              No podés quitarte el rol de administrador.
            </AppText>
          ) : null}
        </View>

        {!editando ? (
          <>
            <TextField
              label="Contraseña"
              required
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                limpiarError('password');
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
                limpiarError('confirmacion');
              }}
              placeholder="Repetí la contraseña"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={PASSWORD_MAX}
              editable={!guardando}
              error={errors.confirmacion}
            />
          </>
        ) : null}

        {submitError ? (
          <View style={styles.errorBox} accessibilityLiveRegion="polite">
            <Ionicons name="alert-circle" size={18} color={palette.danger} />
            <AppText variant="caption" color={palette.danger} style={styles.errorText}>
              {submitError}
            </AppText>
          </View>
        ) : null}

        <Button
          title={editando ? 'Guardar cambios' : 'Crear usuario'}
          onPress={() => void guardar()}
          loading={guardando}
          fullWidth
        />
      </Card>

      <AppText variant="caption" color={palette.warmGray} style={styles.note}>
        Los usuarios no se eliminan: se desactivan desde la lista.
      </AppText>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  card: {
    gap: spacing.lg,
  },
  roleBlock: {
    gap: spacing.sm,
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
  note: {
    textAlign: 'center',
  },
});
