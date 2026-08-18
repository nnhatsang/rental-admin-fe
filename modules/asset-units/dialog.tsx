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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader } from '@tabler/icons-react';
import type { Table } from '@tanstack/react-table';
import { useState } from 'react';
import { Controller, type Resolver, useForm } from 'react-hook-form';
import { useAssetUnits } from './asset-units-provider';
import { assetConditionOptions, assetStatusOptions } from './display-config';
import { useCreateAssetUnit } from './hooks/use-create-asset-unit';
import { useDeleteAssetUnits } from './hooks/use-delete-asset-units';
import { useUpdateAssetUnit } from './hooks/use-update-asset-unit';
import { useUpdateAssetUnitStatus } from './hooks/use-update-asset-unit-status';
import { ProductCombobox } from './product-combobox';
import {
  assetUnitFormSchema,
  assetUnitStatusSchema,
  type IAssetUnitFormInput,
  type IAssetUnitStatusInput,
} from './schema';
import {
  AssetCondition,
  AssetStatus,
  type IAssetUnitOut,
  type IUpdateAssetUnitReq
} from './type';

type AssetUnitFormDialogProps = {
  currentRow?: IAssetUnitOut;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readOnly?: boolean;
  defaultProductId?: string;
};

function AssetUnitSelectField({
  value,
  onChange,
  disabled,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function AssetUnitFormDialog({
  currentRow,
  open,
  onOpenChange,
  readOnly = false,
  defaultProductId = '',
}: AssetUnitFormDialogProps) {
  const isEdit = !!currentRow;
  const text = TITLE_PAGE.ASSET_UNITS;
  const [comboboxPortalContainer, setComboboxPortalContainer] = useState<HTMLDivElement | null>(null);
  const createMutation = useCreateAssetUnit();
  const updateMutation = useUpdateAssetUnit();
  const isPending = isEdit ? updateMutation.isPending : createMutation.isPending;
  const getPlaceholder = (placeholder: string) => (readOnly ? undefined : placeholder);

  const {
    reset,
    formState: { isDirty, dirtyFields },
    handleSubmit,
    control,
  } = useForm<IAssetUnitFormInput>({
    resolver: zodResolver(assetUnitFormSchema) as Resolver<IAssetUnitFormInput>,
    defaultValues: currentRow
      ? {
          productId: currentRow.product.id,
          serialNumber: currentRow.serialNumber ?? '',
          status: currentRow.status,
          condition: currentRow.condition,
          note: currentRow.note ?? '',
          isActive: currentRow.isActive,
        }
      : {
          productId: defaultProductId,
          serialNumber: '',
          status: AssetStatus.AVAILABLE,
          condition: AssetCondition.GOOD,
          note: '',
          isActive: true,
        },
  });

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = (values: IAssetUnitFormInput) => {
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
        return dirtyFields[key as keyof IAssetUnitFormInput];
      }),
    ) as IUpdateAssetUnitReq;

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
      <DialogContent className="sm:max-w-2xl">
        <div ref={setComboboxPortalContainer} className="contents">
          <DialogHeader>
            <DialogTitle>
              {readOnly
                ? text.DIALOG.FORM_VIEW_TITLE
                : isEdit
                  ? text.DIALOG.FORM_EDIT_TITLE
                  : text.DIALOG.FORM_CREATE_TITLE}
            </DialogTitle>
            <DialogDescription>
              {readOnly
                ? text.DIALOG.FORM_VIEW_DESCRIPTION
                : isEdit
                  ? text.DIALOG.FORM_EDIT_DESCRIPTION
                  : text.DIALOG.FORM_CREATE_DESCRIPTION}
            </DialogDescription>
          </DialogHeader>

          <form id="asset-unit-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-2">
              <Controller
                control={control}
                name="productId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{text.FORM.PRODUCT_ID}</FieldLabel>
                    <ProductCombobox
                      value={field.value}
                      onChange={field.onChange}
                      ariaInvalid={fieldState.invalid}
                      placeholder={getPlaceholder(text.FORM.FILTER_PRODUCT_PLACEHOLDER)}
                      disabled={readOnly}
                      selectedProduct={currentRow?.product}
                      syncToUrl={false}
                      portalContainer={comboboxPortalContainer}
                      fetchEnabled={open && !readOnly}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="serialNumber"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{text.FORM.SERIAL_NUMBER}</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder={getPlaceholder(text.FORM.SERIAL_NUMBER_PLACEHOLDER)}
                      disabled={readOnly}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="status"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{text.FORM.STATUS}</FieldLabel>
                      <AssetUnitSelectField
                        value={field.value}
                        onChange={field.onChange}
                        disabled={readOnly}
                        options={assetStatusOptions}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="condition"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{text.FORM.CONDITION}</FieldLabel>
                      <AssetUnitSelectField
                        value={field.value}
                        onChange={field.onChange}
                        disabled={readOnly}
                        options={assetConditionOptions}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <Controller
                control={control}
                name="note"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{text.FORM.NOTE}</FieldLabel>
                    <Textarea
                      {...field}
                      value={field.value ?? ''}
                      placeholder={getPlaceholder(text.FORM.NOTE_PLACEHOLDER)}
                      disabled={readOnly}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <Field orientation="horizontal" className="justify-between rounded-md border p-3">
                    <div>
                      <FieldLabel htmlFor={field.name}>{text.FORM.IS_ACTIVE}</FieldLabel>
                      <p className="text-sm text-muted-foreground">{text.FORM.IS_ACTIVE_DESCRIPTION}</p>
                    </div>
                    <Switch disabled={readOnly} checked={field.value ?? true} onCheckedChange={field.onChange} />
                  </Field>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                {text.DIALOG.CANCEL}
              </Button>
              {!readOnly && (
                <Button type="submit" form="asset-unit-form" disabled={isPending||!isDirty}>
                  {isPending && <IconLoader className="mr-2 size-4 animate-spin" />}
                  {isEdit ? text.DIALOG.SAVE_CHANGES : text.DIALOG.CREATE_SUBMIT}
                </Button>
              )}
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AssetUnitDeleteConfirmDialog({
  open,
  onOpenChange,
  assetUnits,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetUnits: IAssetUnitOut[];
  onSuccess?: () => void;
}) {
  const deleteMutation = useDeleteAssetUnits();
  const text = TITLE_PAGE.ASSET_UNITS;
  const isMulti = assetUnits.length > 1;

  const handleDelete = () => {
    onOpenChange(false);
    deleteMutation.mutate(
      assetUnits.map((assetUnit) => assetUnit.id),
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
          text.DIALOG.DELETE_MULTI_DESCRIPTION.replace('{count}', String(assetUnits.length))
        ) : (
          <>
            {text.DIALOG.DELETE_SINGLE_PREFIX}{' '}
            <strong>{assetUnits[0]?.serialNumber || assetUnits[0]?.product.name}</strong>?
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

function AssetUnitStatusDialog({
  open,
  onOpenChange,
  assetUnit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetUnit: IAssetUnitOut;
}) {
  const mutation = useUpdateAssetUnitStatus();
  const text = TITLE_PAGE.ASSET_UNITS;
  const {
    reset,
    handleSubmit,
    control,
  } = useForm<IAssetUnitStatusInput>({
    resolver: zodResolver(assetUnitStatusSchema) as Resolver<IAssetUnitStatusInput>,
    defaultValues: {
      status: assetUnit.status,
      condition: assetUnit.condition,
      isActive: assetUnit.isActive,
    },
  });

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = (values: IAssetUnitStatusInput) => {
    mutation.mutate(
      {
        id: assetUnit.id,
        data: values,
      },
      { onSuccess: handleClose },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : handleClose())}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{text.DIALOG.STATUS_TITLE}</DialogTitle>
          <DialogDescription>
            {text.DIALOG.STATUS_DESCRIPTION_PREFIX} <strong>{assetUnit.serialNumber}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form id="asset-unit-status-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="status"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{text.FORM.STATUS}</FieldLabel>
                    <AssetUnitSelectField value={field.value} onChange={field.onChange} options={assetStatusOptions} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="condition"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{text.FORM.CONDITION}</FieldLabel>
                    <AssetUnitSelectField
                      value={field.value}
                      onChange={field.onChange}
                      options={assetConditionOptions}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Field orientation="horizontal" className="justify-between rounded-md border p-3">
                  <div>
                    <FieldLabel htmlFor={field.name}>{text.FORM.IS_ACTIVE}</FieldLabel>
                    <p className="text-sm text-muted-foreground">{text.FORM.IS_ACTIVE_DESCRIPTION}</p>
                  </div>
                  <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
                </Field>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {text.DIALOG.CANCEL}
            </Button>
            <Button type="submit" form="asset-unit-status-form" disabled={mutation.isPending}>
              {mutation.isPending && <IconLoader className="mr-2 size-4 animate-spin" />}
              {text.DIALOG.CONFIRM_STATUS}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AssetUnitDialogs({
  table,
  defaultProductId,
}: {
  table: Table<IAssetUnitOut>;
  defaultProductId?: string;
}) {
  const { open, setOpen, currentRow, setCurrentRow } = useAssetUnits();

  const closeDialog = () => {
    setOpen(null);
    setTimeout(() => setCurrentRow(null), 300);
  };
  const isFormOpen = open === 'view' || open === 'edit';
  const readOnly = open === 'view';

  return (
    <>
      <AssetUnitFormDialog
        key="asset-unit-add"
        open={open === 'add'}
        onOpenChange={(nextOpen) => (nextOpen ? setOpen('add') : closeDialog())}
        defaultProductId={defaultProductId}
      />
      <AssetUnitDeleteConfirmDialog
        open={open === 'delete-multi'}
        onOpenChange={(nextOpen) => (nextOpen ? setOpen('delete-multi') : closeDialog())}
        assetUnits={table.getFilteredSelectedRowModel().rows.map((row) => row.original)}
        onSuccess={() => table.resetRowSelection()}
      />
      {currentRow && (
        <>
          <AssetUnitFormDialog
            key={`asset-unit-form-${currentRow.id}`}
            open={isFormOpen}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen(readOnly ? 'view' : 'edit') : closeDialog())}
            currentRow={currentRow}
            readOnly={readOnly}
          />
          <AssetUnitStatusDialog
            key={`asset-unit-status-${currentRow.id}`}
            open={open === 'status'}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen('status') : closeDialog())}
            assetUnit={currentRow}
          />
          <AssetUnitDeleteConfirmDialog
            open={open === 'delete'}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen('delete') : closeDialog())}
            assetUnits={[currentRow]}
          />
        </>
      )}
    </>
  );
}
