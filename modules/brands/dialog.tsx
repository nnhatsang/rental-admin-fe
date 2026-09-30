'use client';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader } from '@tabler/icons-react';
import type { Table } from '@tanstack/react-table';
import { Controller, useForm } from 'react-hook-form';
import { useBrands } from './brand-provider';
import { useCreateBrand } from './hooks/use-create-brand';
import { useDeleteBrands } from './hooks/use-delete-brands';
import { useUpdateBrand } from './hooks/use-update-brand';
import { useUpdateBrandStatus } from './hooks/use-update-brand-status';
import { brandFormSchema, type IBrandFormInput } from './schema';
import type { IBrandOut, IUpdateBrandReq } from './type';

type BrandFormDialogProps = {
  currentRow?: IBrandOut;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readOnly?: boolean;
  mode?: 'create' | 'edit' | 'view';
};

function BrandFormDialog({ currentRow, open, onOpenChange, readOnly = false, mode }: BrandFormDialogProps) {
  const isEdit = mode ? mode === 'edit' : Boolean(currentRow);
  const isReadOnly = readOnly || mode === 'view';
  const text = TITLE_PAGE.BRAND;
  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand();
  const isPending = isEdit ? updateMutation.isPending : createMutation.isPending;
  const { reset, formState: { isDirty, dirtyFields }, handleSubmit, control } = useForm<IBrandFormInput>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: { name: currentRow?.name ?? '', slug: currentRow?.slug ?? '', isActive: currentRow?.isActive ?? true },
  });

  const handleClose = () => { reset(); onOpenChange(false); };
  const onSubmit = (values: IBrandFormInput) => {
    if (isReadOnly) return;
    const normalizedValues = { ...values, slug: values.slug || undefined };
    if (!currentRow) { createMutation.mutate(normalizedValues, { onSuccess: handleClose }); return; }
    if (!isDirty) { handleClose(); return; }
    const dirtyValues = Object.fromEntries(
      Object.entries(normalizedValues).filter(([key]) => dirtyFields[key as keyof IBrandFormInput]),
    ) as IUpdateBrandReq;
    updateMutation.mutate({ id: currentRow.id, data: dirtyValues }, { onSuccess: handleClose });
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : handleClose())}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isReadOnly ? text.DIALOG.FORM_VIEW_TITLE : isEdit ? text.DIALOG.FORM_EDIT_TITLE : text.DIALOG.FORM_CREATE_TITLE}</DialogTitle>
          <DialogDescription>{isReadOnly ? text.DIALOG.FORM_VIEW_DESCRIPTION : isEdit ? text.DIALOG.FORM_EDIT_DESCRIPTION : text.DIALOG.FORM_CREATE_DESCRIPTION}</DialogDescription>
        </DialogHeader>
        <form id="brand-form" onSubmit={handleSubmit(onSubmit)}>
          <ScrollArea className="h-auto max-h-[calc(100dvh-260px)]">
            <div className="grid gap-4 py-2">
              <Controller control={control} name="name" render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{text.FORM.NAME}</FieldLabel>
                  <Input {...field} id={field.name} placeholder={text.FORM.NAME_PLACEHOLDER} disabled={isReadOnly} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )} />
              <Controller control={control} name="slug" render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{text.FORM.SLUG}</FieldLabel>
                  <Input {...field} id={field.name} value={field.value ?? ''} placeholder={text.FORM.SLUG_PLACEHOLDER} disabled={isReadOnly} aria-invalid={fieldState.invalid} />
                  <FieldDescription>Dùng chữ thường, số hoặc dấu gạch nối; có thể để trống.</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )} />
              <Controller control={control} name="isActive" render={({ field }) => (
                <Field orientation="horizontal" className="items-center justify-between rounded-lg bg-muted/40 p-3">
                  <div><FieldLabel htmlFor="brand-is-active">{text.FORM.IS_ACTIVE}</FieldLabel><FieldDescription>{text.FORM.IS_ACTIVE_DESCRIPTION}</FieldDescription></div>
                  <Switch id="brand-is-active" checked={field.value} onCheckedChange={field.onChange} disabled={isReadOnly} />
                </Field>
              )} />
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>{text.DIALOG.CANCEL}</Button>
            {!isReadOnly && <Button type="submit" form="brand-form" disabled={isPending || (!isEdit && !isDirty)}>{isPending && <IconLoader className="mr-2 size-4 animate-spin" />} {isEdit ? text.DIALOG.SAVE_CHANGES : text.DIALOG.CREATE_SUBMIT}</Button>}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BrandDeleteConfirmDialog({ open, onOpenChange, brands, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; brands: IBrandOut[]; onSuccess?: () => void }) {
  const text = TITLE_PAGE.BRAND;
  const mutation = useDeleteBrands();
  const isMulti = brands.length > 1;
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={text.DIALOG.DELETE_TITLE}
      desc={isMulti ? text.DIALOG.DELETE_MULTI_DESCRIPTION.replace('{count}', String(brands.length)) : <>{text.DIALOG.DELETE_DESCRIPTION_PREFIX} <strong>{brands[0]?.name}</strong>? Sản phẩm sẽ không còn thuộc mục này.</>}
      confirmText={text.DIALOG.CONFIRM_DELETE}
      cancelBtnText={text.DIALOG.CANCEL}
      destructive
      handleConfirm={() => { onOpenChange(false); mutation.mutate(brands.map((brand) => brand.id), { onSuccess }); }}
    />
  );
}

function BrandStatusDialog({ currentRow, open, onOpenChange }: { currentRow: IBrandOut; open: boolean; onOpenChange: (open: boolean) => void }) {
  const text = TITLE_PAGE.BRAND;
  const mutation = useUpdateBrandStatus();
  const nextActive = !currentRow.isActive;
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={nextActive ? text.DIALOG.STATUS_ENABLE_TITLE : text.DIALOG.STATUS_DISABLE_TITLE}
      desc={`${text.DIALOG.STATUS_DESCRIPTION_PREFIX} ${nextActive ? 'bật lại' : 'tạm tắt'} “${currentRow.name}”?`}
      confirmText={nextActive ? 'Bật lại' : 'Tạm tắt'}
      cancelBtnText={text.DIALOG.CANCEL}
      destructive={!nextActive}
      handleConfirm={() => { onOpenChange(false); mutation.mutate({ id: currentRow.id, data: { isActive: nextActive } }); }}
    />
  );
}

export function BrandDialogs({ table }: { table: Table<IBrandOut> }) {
  const { open, setOpen, currentRow, setCurrentRow } = useBrands();
  const closeDialog = () => { setOpen(null); setTimeout(() => setCurrentRow(null), 300); };
  const isFormOpen = open === 'view' || open === 'edit';
  const readOnly = open === 'view';
  return (
    <>
      <BrandFormDialog key="brand-add" open={open === 'add'} onOpenChange={(nextOpen) => (nextOpen ? setOpen('add') : closeDialog())} />
      <BrandDeleteConfirmDialog open={open === 'delete-multi'} onOpenChange={(nextOpen) => (nextOpen ? setOpen('delete-multi') : closeDialog())} brands={table.getFilteredSelectedRowModel().rows.map((row) => row.original)} onSuccess={() => table.resetRowSelection()} />
      {currentRow && <>
        <BrandFormDialog key={`brand-form-${currentRow.id}`} open={isFormOpen} onOpenChange={(nextOpen) => (nextOpen ? setOpen(readOnly ? 'view' : 'edit') : closeDialog())} currentRow={currentRow} readOnly={readOnly} />
        <BrandStatusDialog currentRow={currentRow} open={open === 'status'} onOpenChange={(nextOpen) => (nextOpen ? setOpen('status') : closeDialog())} />
        <BrandDeleteConfirmDialog open={open === 'delete'} onOpenChange={(nextOpen) => (nextOpen ? setOpen('delete') : closeDialog())} brands={[currentRow]} />
      </>}
    </>
  );
}

export default BrandDialogs;
