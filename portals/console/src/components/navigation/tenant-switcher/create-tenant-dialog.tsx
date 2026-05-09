'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button, Input, Label } from '@vxture/design-system';
import { useTenant, type TenantType } from '@/features/tenant';

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function CreateTenantDialog({
  open,
  type,
  onClose,
  onCreated,
}: {
  open: boolean;
  type: TenantType;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { createTenant } = useTenant();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const title = type === 'personal' ? 'Create personal workspace' : 'Create workspace';

  useEffect(() => {
    if (!open) {
      setName('');
      setSlug('');
      setError(null);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim();
    const nextSlug = toSlug(slug || name);

    if (!nextName || !nextSlug) {
      setError('Workspace name and slug are required.');
      return;
    }

    try {
      await createTenant({ name: nextName, slug: nextSlug, type });
      onCreated();
      onClose();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create workspace.');
    }
  }

  return (
    <div className="vx-tenant-dialog" role="dialog" aria-modal="true" aria-labelledby="tenant-dialog-title">
      <div className="vx-tenant-dialog__backdrop" onClick={onClose} />
      <form className="vx-tenant-dialog__card" onSubmit={handleSubmit}>
        <div className="vx-tenant-dialog__header">
          <div>
            <p>Workspace</p>
            <h2 id="tenant-dialog-title">{title}</h2>
          </div>
          <button type="button" className="vx-tenant-dialog__close" aria-label="Close" onClick={onClose}>
            x
          </button>
        </div>

        <div className="vx-tenant-dialog__fields">
          <Label>
            Name
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Acme AI Lab" />
          </Label>
          <Label>
            Slug
            <Input
              value={slug}
              onChange={(event) => setSlug(toSlug(event.target.value))}
              placeholder={toSlug(name) || 'acme-ai-lab'}
            />
          </Label>
          <Label>
            Type
            <Input value={type === 'personal' ? 'Personal workspace' : 'Organization workspace'} disabled />
          </Label>
        </div>

        {error ? <p className="vx-tenant-dialog__error">{error}</p> : null}

        <div className="vx-tenant-dialog__actions">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">{title}</Button>
        </div>
      </form>
    </div>
  );
}
