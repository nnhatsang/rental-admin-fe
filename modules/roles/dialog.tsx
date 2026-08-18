'use client';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
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
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { applyApiFormErrors } from '@/utils/form-error';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader } from '@tabler/icons-react';
import type { Table as TanStackTable } from '@tanstack/react-table';
import { Controller, useForm } from 'react-hook-form';
import { useGetPermissions } from '../permissions/hooks/use-get-permissions';
import { useCreateRole } from './hooks/use-create-role';
import { useDeleteRole } from './hooks/use-delete-role';
import { useUpdateRole } from './hooks/use-update-role';
import { PermissionMatrixField } from './permission-matrix-field';
import { assignRoleUsersSchema, createRoleSchema, IAssignRoleUsersInput, ICreateRoleInput } from './schema';
import { IRoleOut, IUpdateRoleReq } from './type';
import { useRoles } from './roles-provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAssignLogic } from './hooks/use-assign-logic';
import { useMemo, useState } from 'react';
import { List } from '@/utils/enums/list.enum';
import { useAssgignUser } from './hooks/use-assign';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { AlertTriangle } from 'lucide-react';

type RoleFormValues = ICreateRoleInput;

function getRoleFormDefaultValues(currentRow?: IRoleOut): RoleFormValues {
  if (!currentRow) {
    return { code: '', description: '', name: '', permissionCodes: [] };
  }

  return {
    code: currentRow.code,
    name: currentRow.name,
    description: currentRow.description ?? undefined,
    permissionCodes: currentRow.permissions.map((permission) => permission.code),
  };
}

function RoleFormDialog({
  open,
  onOpenChange,
  currentRow,
  readOnly = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: IRoleOut;
  readOnly?: boolean;
}) {
  const isEdit = !!currentRow;
  const text = TITLE_PAGE.ROLES;
  const permissionsQuery = useGetPermissions();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const isPending = isEdit ? updateMutation.isPending : createMutation.isPending;

  const {
    reset,
    formState: { isDirty, dirtyFields },
    handleSubmit,
    control,
  } = useForm<RoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: getRoleFormDefaultValues(currentRow),
  });

  const allPermissions = useMemo(() => permissionsQuery.data?.data ?? [], [permissionsQuery.data?.data]);

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = (values: RoleFormValues) => {
    if (readOnly) return;

    if (!currentRow) {
      createMutation.mutate(values, {
        onSuccess: handleClose,
      });
      return;
    }

    if (!isDirty) {
      handleClose();
      return;
    }
    const dirtyValues = Object.fromEntries(
      Object.entries(values).filter(([key]) => {
        return dirtyFields[key as keyof RoleFormValues];
      }),
    ) as IUpdateRoleReq;

    updateMutation.mutate(
      {
        id: currentRow.id,
        data: dirtyValues,
      },
      { onSuccess: handleClose },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? text.DIALOG.FORM_EDIT_TITLE : text.DIALOG.FORM_CREATE_TITLE}</DialogTitle>
          <DialogDescription>
            {isEdit ? text.DIALOG.FORM_EDIT_DESCRIPTION : text.DIALOG.FORM_CREATE_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <form id="role-form" onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="h-[50dvh] max-h-[calc(100dvh-220px)]">
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Controller
                  control={control}
                  name="code"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{text.FORM.CODE}</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        disabled={readOnly}
                        placeholder={text.FORM.CODE_PLACEHOLDER}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{text.FORM.NAME}</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        disabled={readOnly}
                        placeholder={text.FORM.NAME_PLACEHOLDER}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
              <Controller
                control={control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{text.FORM.DESCRIPTION}</FieldLabel>
                    <Textarea
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      disabled={readOnly}
                      placeholder={text.FORM.DESCRIPTION_PLACEHOLDER}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="permissionCodes"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{text.FORM.PERMISSIONS}</FieldLabel>
                    <ScrollArea className="rounded-md border">
                      <PermissionMatrixField
                        {...field}
                        aria-invalid={fieldState.invalid}
                        emptyText={text.FORM.PERMISSIONS_EMPTY}
                        permissions={allPermissions}
                        value={field.value ?? []}
                        onChange={field.onChange}
                        readOnly={readOnly}
                      />
                    </ScrollArea>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </ScrollArea>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="h-10">
              {text.DIALOG.CANCEL}
            </Button>
            <Button type="submit" disabled={isPending || !isDirty} className="h-10 min-w-[100px]">
              {isPending && <IconLoader className="mr-2 size-4 animate-spin" />}
              {isEdit ? text.DIALOG.SAVE_CHANGES : text.DIALOG.CREATE_SUBMIT}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AssignRoleDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: IRoleOut;
}) {
  const { inOutList, setInOutList, table } = useAssignLogic({ roleCode: currentRow.code });
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [pendingAssignValues, setPendingAssignValues] = useState<IAssignRoleUsersInput | null>(null);

  const text = TITLE_PAGE.ROLES;
  const { mutate, isPending } = useAssgignUser();

  const handleClose = () => {
    setConfirmRemoveOpen(false);
    setPendingAssignValues(null);
    onOpenChange(false);
    setInOutList(List.In);
  };

  const form = useForm<IAssignRoleUsersInput>({
    resolver: zodResolver(assignRoleUsersSchema),
    defaultValues: {
      roleId: currentRow.id,
      userIds: [],
      operation: 'ASSIGN',
    },
  });
  const { clearErrors, getValues, setError, setValue, trigger, formState } = form;

  const submitAssignUsers = (values: IAssignRoleUsersInput) => {
    mutate(values, {
      onError: (err) => applyApiFormErrors(form, err, { fallbackMessage: text.ERRORS.UPDATE_FAILED }),
      onSuccess: handleClose,
    });
  };

  const handleSave = async () => {
    const userIds = selectedRows.map((row) => row.original.id);

    if (userIds.length === 0) {
      setValue('userIds', [], { shouldValidate: false });
      setError('userIds', {
        type: 'manual',
        message: 'Vui lòng chọn ít nhất một người dùng',
      });
      return;
    }

    clearErrors('userIds');
    setValue('userIds', userIds, { shouldValidate: true });

    const isValid = await trigger(['roleId', 'userIds']);
    if (!isValid) return;

    const operation: IAssignRoleUsersInput['operation'] = inOutList === List.In ? 'REMOVE' : 'ASSIGN';
    const values: IAssignRoleUsersInput = {
      ...getValues(),
      userIds,
      operation,
    };

    if (inOutList === List.In) {
      setPendingAssignValues(values);
      setConfirmRemoveOpen(true);
      return;
    }

    submitAssignUsers(values);
  };

  const handleConfirmRemove = () => {
    if (!pendingAssignValues) return;

    setConfirmRemoveOpen(false);
    submitAssignUsers(pendingAssignValues);
  };

  const handleConfirmRemoveOpenChange = (nextOpen: boolean) => {
    setConfirmRemoveOpen(nextOpen);
    if (!nextOpen) {
      setPendingAssignValues(null);
    }
  };

  const items = [
    {
      value: List.In,
      label: 'Gỡ nhóm quyền của quản trị viên',
    },
    {
      value: List.Out,
      label: 'Gán nhóm quyền cho quản trị viên',
    },
  ];
  return (
    <>
      <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
        <DialogContent className="flex max-h-[90dvh] flex-col overflow-hidden md:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{text.DIALOG.ASSIGN_TITLE}</DialogTitle>
            <DialogDescription>{text.DIALOG.ASSIGN_DESCRIPTION}</DialogDescription>
          </DialogHeader>

          <form
            id="assign-form"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSave();
            }}
          >
            <div className="min-h-0 overflow-x-auto no-scrollbar p-1">
              <div className="mb-5 flex items-center justify-between">
                <Select value={String(inOutList)} onValueChange={(value) => setInOutList(Number(value) as List)}>
                  <SelectTrigger className="w-65">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.value} value={String(item.value)}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DataTable table={table} surfaceClassName="h-[260px]" />
              {formState.errors.userIds && (
                <div className="mt-2">
                  <FieldError errors={[formState.errors.userIds]} />
                </div>
              )}
            </div>

            <DialogFooter className="mt-4 shrink-0 border-t pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="h-10">
                {text.DIALOG.CANCEL}
              </Button>
              <Button type="submit" disabled={isPending} className="h-10 min-w-25">
                {isPending && <IconLoader className="mr-2 size-4 animate-spin" />}
                {text.DIALOG.SAVE_CHANGES}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmRemoveOpen}
        onOpenChange={handleConfirmRemoveOpenChange}
        title="Xác nhận gỡ nhóm quyền"
        desc={
          <>
            Bạn có chắc muốn gỡ nhóm quyền <strong>{currentRow.name}</strong> khỏi{' '}
            <strong>{pendingAssignValues?.userIds.length ?? 0}</strong> người dùng đã chọn?
          </>
        }
        cancelBtnText={text.DIALOG.CANCEL}
        confirmText="Xác nhận gỡ"
        destructive
        disabled={!pendingAssignValues}
        isLoading={isPending}
        handleConfirm={handleConfirmRemove}
      />
    </>
  );
}

function RoleDeleteConfirmDialog({
  open,
  onOpenChange,
  roles,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: IRoleOut[];
  onSuccess?: () => void;
}) {
  const text = TITLE_PAGE.ROLES;
  const deleteMutation = useDeleteRole();
  const deletableRoles = roles.filter((role) => !role.isSystem);
  const skippedCount = roles.length - deletableRoles.length;
  const isMulti = roles.length > 1;

  const handleDelete = () => {
    if (deletableRoles.length === 0) return;

    onOpenChange(false);
    deleteMutation.mutate(
      deletableRoles.map((role) => role.id),
      {
        onSuccess,
      },
    );
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        isMulti ? (
          <span className="text-destructive">
            <AlertTriangle className="me-1 inline-block stroke-destructive" size={18} /> {text.DIALOG.DELETE_TITLE}{' '}
            {deletableRoles.length} roles
          </span>
        ) : (
          text.DIALOG.DELETE_TITLE
        )
      }
      desc={
        isMulti ? (
          <>
            Are you sure you want to delete {deletableRoles.length} {deletableRoles.length > 1 ? 'roles' : 'role'}?
            {skippedCount > 0 && (
              <>
                {' '}
                {skippedCount} system {skippedCount > 1 ? 'roles were' : 'role was'} skipped.
              </>
            )}
          </>
        ) : (
          <>
            {text.DIALOG.DELETE_DESCRIPTION_PREFIX} <strong>{deletableRoles[0]?.name}</strong>?{' '}
            {text.DIALOG.DELETE_DESCRIPTION_SUFFIX}
          </>
        )
      }
      confirmText={text.DIALOG.CONFIRM_DELETE}
      cancelBtnText={text.DIALOG.CANCEL}
      destructive
      disabled={deletableRoles.length === 0}
      isLoading={deleteMutation.isPending}
      handleConfirm={handleDelete}
    />
  );
}

export function RoleDialogs({ table }: { table: TanStackTable<IRoleOut> }) {
  const { open, setOpen, setCurrentRow, currentRow } = useRoles();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedRoles = selectedRows.map((row) => row.original);
  const closeDialog = () => {
    setOpen(null);
    setTimeout(() => {
      setCurrentRow(null);
    }, 500);
  };
  const isFormOpen = open === 'view' || open === 'edit';
  const readOnly = open === 'view';
  return (
    <>
      <RoleFormDialog
        key="role-add"
        open={open === 'add'}
        onOpenChange={(nextOpen) => (nextOpen ? setOpen('add') : closeDialog())}
      />
      {currentRow && (
        <>
          <RoleFormDialog
            key={`role-form-${currentRow.id}`}
            open={isFormOpen}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen(readOnly ? 'view' : 'edit') : closeDialog())}
            currentRow={currentRow}
            readOnly={readOnly}
          />
          <AssignRoleDialog
            key={`assign-users-${currentRow.id}`}
            open={open === 'assgin'}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen('assgin') : closeDialog())}
            currentRow={currentRow}
          />
          <RoleDeleteConfirmDialog
            key={`role-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen('delete') : closeDialog())}
            roles={[currentRow]}
          />
        </>
      )}
      <RoleDeleteConfirmDialog
        key="role-delete-multi"
        open={open === 'delete-multi'}
        onOpenChange={(nextOpen) => (nextOpen ? setOpen('delete-multi') : closeDialog())}
        roles={selectedRoles}
        onSuccess={() => table.resetRowSelection()}
      />
    </>
  );
}
