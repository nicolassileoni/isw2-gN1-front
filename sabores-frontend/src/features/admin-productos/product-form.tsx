import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { AppText, Button, Card, TextField } from '@/components/ui';
import { palette, radii, semantic, spacing } from '@/constants/theme';
import { LocalSelector } from '@/features/admin-catalogo/local-selector';
import { ApiHttpError, apiClient } from '@/lib/api/client';
import { apiRoutes } from '@/lib/api/routes';
import type {
  CategoriaResponse,
  LocalAdminResponse,
  ProductoAdminResponse,
  ProductoRequest,
} from '@/lib/api/types';

import { OptionSheet, SelectField, type SelectOption } from './select-field';

const NOMBRE_MAX = 80;
const DESCRIPCION_MAX = 200;

type Campo = 'local' | 'categoria' | 'nombre' | 'descripcion' | 'precio' | 'stock';
type FormErrors = Partial<Record<Campo, string>>;

function parsePrecio(texto: string): number | null {
  const valor = texto.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(valor)) return null;

  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

function parseStock(texto: string): number | null {
  const valor = texto.trim();
  if (!/^\d+$/.test(valor)) return null;

  const numero = Number(valor);
  return Number.isSafeInteger(numero) ? numero : null;
}

function mensajeDeError(error: unknown): string {
  if (error instanceof ApiHttpError) {
    if (error.status === 404) return 'No encontramos ese producto.';
    return error.message || 'No pudimos guardar el producto. Intentá de nuevo.';
  }

  return error instanceof Error
    ? error.message
    : 'No pudimos guardar el producto. Intentá de nuevo.';
}

type ProductFormProps = {
  producto: ProductoAdminResponse | null;
  locales: LocalAdminResponse[];
  categorias: CategoriaResponse[];
  defaultLocalId: number | null;
  onSaved: () => void;
};

export function ProductForm({
  producto,
  locales,
  categorias,
  defaultLocalId,
  onSaved,
}: ProductFormProps) {
  const [localId, setLocalId] = useState<number | null>(
    producto?.localId ??
      defaultLocalId ??
      locales.find((local) => local.activo)?.id ??
      locales[0]?.id ??
      null,
  );
  const [categoriaId, setCategoriaId] = useState<number | null>(
    producto?.categoriaId ?? null,
  );
  const [nombre, setNombre] = useState(producto?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(producto?.descripcion ?? '');
  const [precioTexto, setPrecioTexto] = useState(producto ? String(producto.precio) : '');
  const [stockTexto, setStockTexto] = useState(producto ? String(producto.stock) : '');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [sheet, setSheet] = useState<'categoria' | null>(null);

  const localSeleccionado = locales.find((local) => local.id === localId) ?? null;
  const categoriaSeleccionada = categorias.find((categoria) => categoria.id === categoriaId) ?? null;

  const categoriaOptions: SelectOption[] = categorias.map((categoria) => ({
    id: categoria.id,
    label: categoria.nombre,
  }));

  const categoriaValue: SelectOption | null = categoriaSeleccionada
    ? { id: categoriaSeleccionada.id, label: categoriaSeleccionada.nombre }
    : null;

  const limpiarError = (campo: Campo) => {
    setErrors((current) => ({ ...current, [campo]: undefined }));
    setSubmitError(null);
  };

  const guardar = async () => {
    if (guardando) return;

    const precio = parsePrecio(precioTexto);
    const stock = parseStock(stockTexto);
    const siguientes: FormErrors = {};

    if (localId === null) siguientes.local = 'Elegí un local.';
    if (categoriaId === null) siguientes.categoria = 'Elegí una categoría.';

    if (!nombre.trim()) siguientes.nombre = 'Ingresá el nombre del producto.';
    else if (nombre.trim().length > NOMBRE_MAX) {
      siguientes.nombre = `El nombre puede tener hasta ${NOMBRE_MAX} caracteres.`;
    }

    if (descripcion.trim().length > DESCRIPCION_MAX) {
      siguientes.descripcion = `La descripción puede tener hasta ${DESCRIPCION_MAX} caracteres.`;
    }

    if (precio === null) {
      siguientes.precio = 'Ingresá un precio válido, con hasta 2 decimales.';
    }

    if (stock === null) {
      siguientes.stock = 'Ingresá una cantidad entera de stock.';
    }

    setErrors(siguientes);

    if (
      Object.keys(siguientes).length > 0 ||
      localId === null ||
      categoriaId === null ||
      precio === null ||
      stock === null
    ) {
      return;
    }

    const body: ProductoRequest = {
      localId,
      categoriaId,
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || null,
      precio,
      stock,
    };

    setGuardando(true);
    setSubmitError(null);

    try {
      if (producto) {
        await apiClient.put<ProductoAdminResponse>(apiRoutes.productos.detail(producto.id), body);
      } else {
        await apiClient.post<ProductoAdminResponse>(apiRoutes.productos.list(), body);
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
          {producto ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
        </AppText>

        <LocalSelector
          locales={locales}
          selectedId={localId}
          onSelect={(local) => {
            setLocalId(local.id);
            limpiarError('local');
          }}
          label="Local"
          required
          error={errors.local}
          helper="Solo se puede asociar a un local existente. Buscá por nombre o dirección."
          disabled={guardando}
        />

        {localSeleccionado && !localSeleccionado.activo ? (
          <View style={styles.warningBox} accessibilityLiveRegion="polite">
            <Ionicons name="alert-circle" size={18} color={palette.warning} />
            <AppText variant="caption" color={palette.warning} style={styles.warningText}>
              Este local está inactivo. Sus productos no se muestran en la carta pública.
            </AppText>
          </View>
        ) : null}

        <SelectField
          label="Categoría"
          value={categoriaValue}
          placeholder="Elegí una categoría"
          onPress={() => setSheet('categoria')}
          error={errors.categoria}
          helper="Las categorías vienen cargadas por el sistema."
          disabled={guardando}
        />

        <TextField
          label="Nombre"
          required
          value={nombre}
          onChangeText={(value) => {
            setNombre(value);
            limpiarError('nombre');
          }}
          placeholder="Ej.: Pizza muzzarella"
          maxLength={NOMBRE_MAX}
          autoCapitalize="sentences"
          editable={!guardando}
          error={errors.nombre}
        />

        <TextField
          label="Descripción"
          value={descripcion}
          onChangeText={(value) => {
            setDescripcion(value);
            limpiarError('descripcion');
          }}
          placeholder="Ingredientes o detalle del producto"
          maxLength={DESCRIPCION_MAX}
          multiline
          numberOfLines={3}
          autoCapitalize="sentences"
          editable={!guardando}
          error={errors.descripcion}
          helper={`Opcional. Hasta ${DESCRIPCION_MAX} caracteres.`}
        />

        <View style={styles.row}>
          <TextField
            label="Precio"
            required
            value={precioTexto}
            onChangeText={(value) => {
              setPrecioTexto(value.replace(',', '.'));
              limpiarError('precio');
            }}
            placeholder="1500.50"
            keyboardType="decimal-pad"
            editable={!guardando}
            error={errors.precio}
            helper="Sin separador de miles. Hasta 2 decimales."
            containerStyle={styles.half}
          />

          <TextField
            label="Stock"
            required
            value={stockTexto}
            onChangeText={(value) => {
              setStockTexto(value.replace(/\D/g, ''));
              limpiarError('stock');
            }}
            placeholder="10"
            keyboardType="number-pad"
            editable={!guardando}
            error={errors.stock}
            helper="Unidades disponibles."
            containerStyle={styles.half}
          />
        </View>

        <AppText variant="caption" color={palette.warmGray}>
          Cambiar el precio no modifica los pedidos anteriores.
        </AppText>

        {submitError ? (
          <View style={styles.errorBox} accessibilityLiveRegion="polite">
            <Ionicons name="alert-circle" size={18} color={palette.danger} />
            <AppText variant="caption" color={palette.danger} style={styles.errorText}>
              {submitError}
            </AppText>
          </View>
        ) : null}

        <Button
          title={producto ? 'Guardar cambios' : 'Crear producto'}
          onPress={() => void guardar()}
          loading={guardando}
          fullWidth
        />
      </Card>

      <AppText variant="caption" color={palette.warmGray} style={styles.note}>
        El estado activo se cambia desde la lista. Los productos no se eliminan.
      </AppText>

      <OptionSheet
        visible={sheet === 'categoria'}
        title="Elegir categoría"
        options={categoriaOptions}
        selectedId={categoriaId}
        onSelect={(option) => {
          setCategoriaId(option.id);
          limpiarError('categoria');
        }}
        onClose={() => setSheet(null)}
      />
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.input,
    backgroundColor: semantic.warningSoft,
  },
  warningText: {
    flex: 1,
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
