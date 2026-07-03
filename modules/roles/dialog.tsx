'use client';

import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getDirtyValues } from '@/lib/dirty-form';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { applyApiFormErrors } from '@/utils/form-error';
import { useGetPermissions } from '../permissions/hooks/use-get-permissions';
import { useCreateRole } from './hooks/use-create-role';
import { useUpdateRole } from './hooks/use-update-role';
import type { IRolesState } from './hooks/use-roles-state';
import { IRoleFormInput, roleFormSchema } from './schema';

function groupPermissions(permissions: Array<{ code: string; name: string; module: string }>) {
  return permissions.reduce<Record<string, Array<{ code: string; name: string }>>>((acc, permission) => {
    acc[permission.module] ??= [];
    acc[permission.module].push({ code: permission.code, name: permission.name });
    return acc;
  }, {});
}

function RoleFormDialog({
  open,
  onOpenChange,
  state,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: IRolesState;
}) {
  const { selectedRole, setSelectedRole } = state;
  const isEdit = selectedRole !== null;
  const text = TITLE_PAGE.ROLES;
  const permissionsQuery = useGetPermissions();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const isPending = isEdit ? updateMutation.isPending : createMutation.isPending;

  const form = useForm<IRoleFormInput>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { code: '', name: '', description: '', permissionCodes: [] },
  });

  const handleClose = React.useCallback(() => {
    onOpenChange(false);
    setSelectedRole(null);
    form.reset();
  }, [form, onOpenChange, setSelectedRole]);

  React.useEffect(() => {
    if (!open) return;

    form.reset(
      isEdit && selectedRole
        ? {
            code: selectedRole.code,
            name: selectedRole.name,
            description: selectedRole.description ?? '',
            permissionCodes: selectedRole.permissions.map((permission) => permission.code),
          }
        : { code: '', name: '', description: '', permissionCodes: [] },
    );
  }, [form, isEdit, open, selectedRole]);

  const permissionGroups = React.useMemo(
    () => groupPermissions(permissionsQuery.data?.data ?? []),
    [permissionsQuery.data?.data],
  );

  const onSubmit = (values: IRoleFormInput) => {
    if (isEdit) {
      if (!selectedRole) return;

      const dirtyValues = getDirtyValues(
        values,
        form.formState.dirtyFields as Partial<Record<keyof IRoleFormInput, boolean>>,
      );

      if (Object.keys(dirtyValues).length === 0) {
        handleClose();
        return;
      }

      updateMutation.mutate(
        { id: selectedRole.id, data: dirtyValues },
        {
          onError: (err) => applyApiFormErrors(form, err, { fallbackMessage: text.ERRORS.UPDATE_FAILED }),
          onSuccess: handleClose,
        },
      );
      return;
    }

    createMutation.mutate(values, {
      onError: (err) => applyApiFormErrors(form, err, { fallbackMessage: text.ERRORS.CREATE_FAILED }),
      onSuccess: handleClose,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEdit ? text.DIALOG.FORM_EDIT_TITLE : text.DIALOG.FORM_CREATE_TITLE}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? text.DIALOG.FORM_EDIT_DESCRIPTION : text.DIALOG.FORM_CREATE_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              control={form.control}
              name="code"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>{text.FORM.CODE}</FieldLabel>
                  <Input {...field} disabled={isEdit} placeholder={text.FORM.CODE_PLACEHOLDER} className="h-10" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>{text.FORM.NAME}</FieldLabel>
                  <Input {...field} placeholder={text.FORM.NAME_PLACEHOLDER} className="h-10" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>{text.FORM.DESCRIPTION}</FieldLabel>
                <Textarea {...field} placeholder={text.FORM.DESCRIPTION_PLACEHOLDER} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="permissionCodes"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>{text.FORM.PERMISSIONS}</FieldLabel>
                <div className="max-h-[320px] overflow-y-auto rounded-md border p-3">
                  {Object.keys(permissionGroups).length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">{text.FORM.PERMISSIONS_EMPTY}</div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(permissionGroups).map(([module, permissions]) => (
                        <div key={module} className="space-y-2">
                          <div className="text-xs font-semibold uppercase text-muted-foreground">{module}</div>
                          <div className="grid gap-2 md:grid-cols-2">
                            {permissions.map((permission) => {
                              const checked = field.value.includes(permission.code);
                              return (
                                <label key={permission.code} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(value) => {
                                      const next = value
                                        ? [...field.value, permission.code]
                                        : field.value.filter((code) => code !== permission.code);
                                      field.onChange(next);
                                    }}
                                  />
                                  <span className="min-w-0 truncate">{permission.name || permission.code}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="h-10">
              {text.DIALOG.CANCEL}
            </Button>
            <Button type="submit" disabled={isPending} className="h-10 min-w-[100px]">
              {isPending && <IconLoader className="mr-2 size-4 animate-spin" />}
              {isEdit ? text.DIALOG.SAVE_CHANGES : text.DIALOG.CREATE_SUBMIT}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RoleDialogs({ state }: { state: IRolesState }) {
  const { selectedRole, isFormOpen, setIsFormOpen, isDeleteOpen, setIsDeleteOpen, isDeleting, handleConfirmDelete } =
    state;
  const text = TITLE_PAGE.ROLES;

  return (
    <>
      <RoleFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} state={state} />

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{text.DIALOG.DELETE_TITLE}</DialogTitle>
            <DialogDescription>
              {text.DIALOG.DELETE_DESCRIPTION_PREFIX} <strong>{selectedRole?.name}</strong>?{' '}
              {text.DIALOG.DELETE_DESCRIPTION_SUFFIX}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)} className="h-10">
              {text.DIALOG.CANCEL}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="h-10 min-w-[100px]"
            >
              {isDeleting && <IconLoader className="mr-2 size-4 animate-spin" />}
              {text.DIALOG.CONFIRM_DELETE}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
