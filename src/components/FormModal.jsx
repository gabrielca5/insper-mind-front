import { useEffect, useMemo, useState } from 'react';
import styles from './FormModal.module.css';

function buildInitialValues(fields, initialValues) {
  return fields.reduce((acc, field) => {
    if (initialValues?.[field.name] !== undefined) {
      acc[field.name] = initialValues[field.name];
    } else if (field.defaultValue !== undefined) {
      acc[field.name] = field.defaultValue;
    } else if (field.type === 'checkbox') {
      acc[field.name] = false;
    } else {
      acc[field.name] = '';
    }

    return acc;
  }, {});
}

function normalizeError(error) {
  const data = error?.response?.data;

  if (typeof data === 'string') return data;
  if (data?.message) return data.message;
  if (data) return JSON.stringify(data);

  return error?.message ?? 'Erro ao enviar.';
}

function normalizeValue(field, value) {
  if (field.type === 'number' || field.valueType === 'number') {
    return value === '' ? '' : Number(value);
  }

  if (field.type === 'checkbox') {
    return Boolean(value);
  }

  return value;
}

function Field({ field, value, onChange }) {
  if (field.hidden) return null;

  if (field.type === 'textarea') {
    return (
      <label className={styles.label}>
        <span>{field.label}</span>
        <textarea
          className={styles.textarea}
          value={value ?? ''}
          required={field.required}
          disabled={field.disabled}
          onChange={(event) => onChange(field, event.target.value)}
        />
      </label>
    );
  }

  if (field.type === 'select') {
    return (
      <label className={styles.label}>
        <span>{field.label}</span>
        <select
          className={styles.input}
          value={value ?? ''}
          required={field.required}
          disabled={field.disabled}
          onChange={(event) => onChange(field, event.target.value)}
        >
          <option value="">Selecione</option>
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <label className={styles.checkLabel}>
        <input
          type="checkbox"
          checked={Boolean(value)}
          disabled={field.disabled}
          onChange={(event) => onChange(field, event.target.checked)}
        />
        <span>{field.label}</span>
      </label>
    );
  }

  return (
    <label className={styles.label}>
      <span>{field.label}</span>
      <input
        className={styles.input}
        type={field.type ?? 'text'}
        value={value ?? ''}
        required={field.required}
        disabled={field.disabled}
        onChange={(event) => onChange(field, event.target.value)}
      />
    </label>
  );
}

export function FormModal({
  title,
  triggerLabel,
  submitLabel = 'Enviar',
  fields,
  initialValues,
  disabled,
  disabledTitle,
  onSubmit,
  onSuccess,
  className,
  open: controlledOpen,
  onOpenChange,
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [values, setValues] = useState(() => buildInitialValues(fields, initialValues));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const open = controlledOpen ?? uncontrolledOpen;

  const setOpen = (nextOpen) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const computedInitialValues = useMemo(
    () => buildInitialValues(fields, initialValues),
    [fields, initialValues]
  );

  useEffect(() => {
    if (open) {
      setValues(computedInitialValues);
      setError('');
      setSuccess('');
    }
  }, [computedInitialValues, open]);

  const updateValue = (field, rawValue) => {
    setValues((current) => ({
      ...current,
      [field.name]: normalizeValue(field, rawValue),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = fields.reduce((acc, field) => {
        if (!field.readOnlyPayload) {
          acc[field.name] = values[field.name];
        }
        return acc;
      }, {});
      const result = await onSubmit(payload);
      setSuccess('Enviado com sucesso.');
      onSuccess?.(result, payload);
      setOpen(false);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {triggerLabel && (
        <button
          type="button"
          className={`${styles.trigger} ${className ?? ''}`}
          disabled={disabled}
          title={disabled ? disabledTitle : undefined}
          onClick={() => setOpen(true)}
        >
          {triggerLabel}
        </button>
      )}

      {open && (
        <div className={styles.backdrop} role="presentation">
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby={`${title}-title`}>
            <div className={styles.head}>
              <h2 id={`${title}-title`} className={styles.title}>{title}</h2>
              <button type="button" className={styles.close} onClick={() => setOpen(false)}>
                Fechar
              </button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              {fields.map((field) => (
                <Field
                  key={field.name}
                  field={field}
                  value={values[field.name]}
                  onChange={updateValue}
                />
              ))}

              {error && <p className={styles.error}>{error}</p>}
              {success && <p className={styles.success}>{success}</p>}

              <button type="submit" className={styles.submit} disabled={loading}>
                {loading ? 'Enviando...' : submitLabel}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function ConfirmButton({
  children,
  message = 'Confirmar ação?',
  onConfirm,
  disabled,
  className,
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!window.confirm(message)) return;

    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`${styles.confirm} ${className ?? ''}`}
      disabled={disabled || loading}
      onClick={handleClick}
    >
      {loading ? 'Aguarde...' : children}
    </button>
  );
}
