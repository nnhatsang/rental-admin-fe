'use client';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader } from '@tabler/icons-react';
import type { Table } from '@tanstack/react-table';
import { Controller, useForm } from 'react-hook-form';
import { useCustomers } from './customer-provider';
import { useCreateCustomer } from './hooks/use-create-customer';
import { useDeleteCustomers } from './hooks/use-delete-customers';
import { useUpdateCustomer } from './hooks/use-update-customer';
import { customerFormSchema, type ICustomerFormInput } from './schema';
import type { ICustomerOut, IUpdateCustomerReq } from './type';

type CustomerFormDialogProps = {
  currentRow?: ICustomerOut;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readOnly?: boolean;
  mode?: 'create' | 'edit' | 'view';
  onSuccess?: (customer: ICustomerOut) => void;
};

type CustomerFormValues = ICustomerFormInput;

export function CustomerFormDialog({
  currentRow,
  open,
  onOpenChange,
  readOnly = false,
  mode,
  onSuccess,
}: CustomerFormDialogProps) {
  const isEdit = mode ? mode === 'edit' : !!currentRow;
  const isReadOnly = readOnly || mode === 'view';
  const text = TITLE_PAGE.CUSTOMER;
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const isPending = isEdit ? updateMutation.isPending : createMutation.isPending;

  const {
    reset,
    formState: { isDirty, dirtyFields },
    handleSubmit,
    control,
  } = useForm<ICustomerFormInput>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: currentRow
      ? {
          name: currentRow.name,
          phone: currentRow.phone ?? '',
          email: currentRow.email ?? '',
          address: currentRow.address ?? '',
          identityNumber: currentRow.identityNumber ?? '',
          socialContact: currentRow.socialContact ?? '',
          notes: currentRow.notes ?? '',
        }
      : {
          name: '',
          phone: '',
          email: '',
          address: '',
          identityNumber: '',
          socialContact: '',
          notes: '',
        },
  });

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = (values: CustomerFormValues) => {
    if (!currentRow) {
      createMutation.mutate(values, {
        onSuccess: (customer) => {
          onSuccess?.(customer);
          handleClose();
        },
      });
      return;
    }

    if (!isDirty) {
      handleClose();
      return;
    }

    const dirtyValues = Object.fromEntries(
      Object.entries(values).filter(([key]) => {
        return dirtyFields[key as keyof ICustomerFormInput];
      }),
    ) as IUpdateCustomerReq;

    updateMutation.mutate(
      {
        id: currentRow.id,
        data: dirtyValues,
      },
      { onSuccess: handleClose },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : handleClose())}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isReadOnly
              ? text.DIALOG.FORM_VIEW_TITLE
              : isEdit
                ? text.DIALOG.FORM_EDIT_TITLE
                : text.DIALOG.FORM_CREATE_TITLE}
          </DialogTitle>
          <DialogDescription>
            {isReadOnly
              ? text.DIALOG.FORM_VIEW_DESCRIPTION
              : isEdit
                ? text.DIALOG.FORM_EDIT_DESCRIPTION
                : text.DIALOG.FORM_CREATE_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <form id="customer-form" onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="h-[50dvh] max-h-[calc(100dvh-220px)]">
            <div className="grid gap-4 py-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{text.FORM.NAME}</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder={text.FORM.NAME_PLACEHOLDER}
                        disabled={isReadOnly}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="phone"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{text.FORM.PHONE}</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder={text.FORM.PHONE_PLACEHOLDER}
                        disabled={isReadOnly}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{text.FORM.EMAIL}</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="email"
                        placeholder={text.FORM.EMAIL_PLACEHOLDER}
                        disabled={isReadOnly}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="identityNumber"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{text.FORM.IDENTITY_NUMBER}</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder={text.FORM.IDENTITY_NUMBER_PLACEHOLDER}
                        disabled={isReadOnly}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <Controller
                control={control}
                name="address"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{text.FORM.ADDRESS}</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder={text.FORM.ADDRESS_PLACEHOLDER}
                      disabled={isReadOnly}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="socialContact"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{text.FORM.SOCIAL_CONTACT}</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder={text.FORM.SOCIAL_CONTACT_PLACEHOLDER}
                      disabled={isReadOnly}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="notes"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{text.FORM.NOTES}</FieldLabel>
                    <Textarea
                      {...field}
                      id={field.name}
                      value={field.value ?? ''}
                      placeholder={text.FORM.NOTES_PLACEHOLDER}
                      disabled={isReadOnly}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {text.DIALOG.CANCEL}
            </Button>
            {!isReadOnly && (
              <Button type="submit" form="customer-form" disabled={isPending || !isDirty}>
                {isPending && <IconLoader className="mr-2 size-4 animate-spin" />}
                {isEdit ? text.DIALOG.SAVE_CHANGES : text.DIALOG.CREATE_SUBMIT}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CustomerDeleteConfirmDialog({
  open,
  onOpenChange,
  customers,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: ICustomerOut[];
  onSuccess?: () => void;
}) {
  const text = TITLE_PAGE.CUSTOMER;
  const deleteMutation = useDeleteCustomers();
  const isMulti = customers.length > 1;

  const handleDelete = () => {
    onOpenChange(false);
    deleteMutation.mutate(
      customers.map((customer) => customer.id),
      { onSuccess },
    );
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={text.DIALOG.DELETE_TITLE}
      desc={
        isMulti ? (
          `Bạn có chắc chắn muốn xóa ${customers.length} khách hàng đã chọn?`
        ) : (
          <>
            {text.DIALOG.DELETE_DESCRIPTION_PREFIX} <strong>{customers[0]?.name}</strong>?{' '}
            {text.DIALOG.DELETE_DESCRIPTION_SUFFIX}
          </>
        )
      }
      confirmText={text.DIALOG.CONFIRM_DELETE}
      cancelBtnText={text.DIALOG.CANCEL}
      destructive
      handleConfirm={handleDelete}
    />
  );
}

export function CustomerDialogs({ table }: { table: Table<ICustomerOut> }) {
  const { open, setOpen, currentRow, setCurrentRow } = useCustomers();

  const closeDialog = () => {
    setOpen(null);
    setTimeout(() => setCurrentRow(null), 300);
  };
  const isFormOpen = open === 'view' || open === 'edit';
  const readOnly = open === 'view';

  return (
    <>
      <CustomerFormDialog
        key="customer-add"
        open={open === 'add'}
        onOpenChange={(nextOpen) => (nextOpen ? setOpen('add') : closeDialog())}
      />
      <CustomerDeleteConfirmDialog
        open={open === 'delete-multi'}
        onOpenChange={(nextOpen) => (nextOpen ? setOpen('delete-multi') : closeDialog())}
        customers={table.getFilteredSelectedRowModel().rows.map((row) => row.original)}
        onSuccess={() => table.resetRowSelection()}
      />
      {currentRow && (
        <>
          <CustomerFormDialog
            key={`customer-form-${currentRow.id}`}
            open={isFormOpen}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen(readOnly ? 'view' : 'edit') : closeDialog())}
            currentRow={currentRow}
            readOnly={readOnly}
          />
          <CustomerDeleteConfirmDialog
            open={open === 'delete'}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen('delete') : closeDialog())}
            customers={[currentRow]}
          />
        </>
      )}
    </>
  );
}

export default CustomerDialogs;
