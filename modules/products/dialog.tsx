'use client';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader, IconPlus, IconTrash } from '@tabler/icons-react';
import type { Table } from '@tanstack/react-table';
import { Controller, type Resolver, useFieldArray, useForm } from 'react-hook-form';
import { useCreateProduct } from './hooks/use-create-product';
import { useDeleteProducts } from './hooks/use-delete-products';
import { useUpdateProduct } from './hooks/use-update-product';
import { useUpdateProductStatus } from './hooks/use-update-product-status';
import { productFormSchema, type IProductFormInput } from './schema';
import type { ICreateProductReq, IProductOut, IUpdateProductReq } from './type';
import { useProducts } from './products-provider';

type ProductFormDialogProps = {
  currentRow?: IProductOut;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readOnly?: boolean;
};

const toNumberOrZero = (value: string | null) => (value === null ? 0 : Number(value));

const normalizePayload = (values: IProductFormInput): ICreateProductReq => ({
  name: values.name.trim(),
  sku: values.sku.trim(),
  description: values.description?.trim() || undefined,
  includedAccessories: values.includedAccessories?.trim() || undefined,
  usageGuide: values.usageGuide?.trim() || undefined,
  categoryId: values.categoryId || undefined,
  brandId: values.brandId || undefined,
  dailyPrice: values.dailyPrice,
  halfDayPrice: values.halfDayPrice,
  hourlyOveragePrice: values.hourlyOveragePrice,
  rentalPriceTiers: values.rentalPriceTiers?.map((tier, index) => ({
    minDays: tier.minDays,
    maxDays: tier.maxDays,
    dailyPrice: tier.dailyPrice,
    name: tier.name?.trim() || undefined,
    sortOrder: tier.sortOrder ?? index,
  })),
  depositAmount: values.depositAmount,
  replacementValue: values.replacementValue,
  isActive: values.isActive,
});

const removeUndefined = <T extends object>(value: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined && item !== ''),
  ) as Partial<T>;
};

function ProductFormDialog({ currentRow, open, onOpenChange, readOnly = false }: ProductFormDialogProps) {
  const isEdit = !!currentRow;
  const text = TITLE_PAGE.PRODUCTS;
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isPending = isEdit ? updateMutation.isPending : createMutation.isPending;

  const form = useForm<IProductFormInput>({
    resolver: zodResolver(productFormSchema) as Resolver<IProductFormInput>,
    defaultValues: currentRow
      ? {
          name: currentRow.name,
          sku: currentRow.sku,
          description: currentRow.description ?? undefined,
          includedAccessories: currentRow.includedAccessories ?? undefined,
          usageGuide: currentRow.usageGuide ?? undefined,
          dailyPrice: Number(currentRow.dailyPrice),
          halfDayPrice: toNumberOrZero(currentRow.halfDayPrice),
          hourlyOveragePrice: toNumberOrZero(currentRow.hourlyOveragePrice),
          categoryId: currentRow.category?.id ?? undefined,
          brandId: currentRow.brand?.id ?? undefined,
          rentalPriceTiers: currentRow.rentalPriceTiers.map((tier) => ({
            minDays: tier.minDays,
            maxDays: tier.maxDays ?? undefined,
            dailyPrice: Number(tier.dailyPrice),
            name: tier.name ?? undefined,
            sortOrder: tier.sortOrder,
          })),
          depositAmount: Number(currentRow.depositAmount),
          replacementValue: toNumberOrZero(currentRow.replacementValue),
          isActive: currentRow.isActive,
        }
      : {
          name: '',
          sku: '',
          description: '',
          includedAccessories: '',
          usageGuide: '',
          dailyPrice: 0,
          halfDayPrice: 0,
          hourlyOveragePrice: 0,
          categoryId: '',
          brandId: '',
          rentalPriceTiers: [],
          depositAmount: 0,
          replacementValue: 0,
          isActive: true,
        },
  });
  const rentalPriceTiers = useFieldArray({
    control: form.control,
    name: 'rentalPriceTiers',
  });

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = (values: IProductFormInput) => {
    if (readOnly) return;

    const payload = normalizePayload(values);

    if (isEdit && currentRow) {
      updateMutation.mutate(
        {
          id: currentRow.id,
          data: removeUndefined(payload) as IUpdateProductReq,
        },
        { onSuccess: handleClose },
      );
      return;
    }

    createMutation.mutate(removeUndefined(payload) as ICreateProductReq, { onSuccess: handleClose });
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : handleClose())}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? text.DIALOG.FORM_EDIT_TITLE : text.DIALOG.FORM_CREATE_TITLE}</DialogTitle>
          <DialogDescription>
            {isEdit ? text.DIALOG.FORM_EDIT_DESCRIPTION : text.DIALOG.FORM_CREATE_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <form id="product-form" onSubmit={form.handleSubmit(onSubmit)}>
          <ScrollArea className="h-[60vh] ">
            <div className="pr-4 py-2 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{text.FORM.NAME}</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder={text.FORM.NAME_PLACEHOLDER}
                        disabled={readOnly}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="sku"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{text.FORM.SKU}</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder={text.FORM.SKU_PLACEHOLDER}
                        disabled={readOnly}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={form.control}
                  name="categoryId"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{text.FORM.CATEGORY}</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder={text.FORM.CATEGORY_PLACEHOLDER}
                        disabled={readOnly}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="brandId"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{text.FORM.BRAND}</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder={text.FORM.BRAND_PLACEHOLDER}
                        disabled={readOnly}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={form.control}
                  name="dailyPrice"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{text.FORM.DAILY_PRICE}</FieldLabel>
                      <CurrencyInput {...field} id={field.name} aria-invalid={fieldState.invalid} disabled={readOnly} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="halfDayPrice"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{text.FORM.HALF_DAY_PRICE}</FieldLabel>
                      <CurrencyInput {...field} id={field.name} aria-invalid={fieldState.invalid} disabled={readOnly} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Controller
                  control={form.control}
                  name="depositAmount"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{text.FORM.DEPOSIT_AMOUNT}</FieldLabel>
                      <CurrencyInput {...field} id={field.name} aria-invalid={fieldState.invalid} disabled={readOnly} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="hourlyOveragePrice"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{text.FORM.HOURLY_OVERAGE_PRICE}</FieldLabel>
                      <CurrencyInput {...field} id={field.name} aria-invalid={fieldState.invalid} disabled={readOnly} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="replacementValue"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{text.FORM.REPLACEMENT_VALUE}</FieldLabel>
                      <CurrencyInput {...field} id={field.name} disabled={readOnly} aria-invalid={fieldState.invalid} />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <div className="space-y-3 rounded-md border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Field>{text.FORM.RENTAL_PRICE_TIERS}</Field>
                    <p className="text-sm text-muted-foreground">{text.FORM.RENTAL_PRICE_TIERS_DESCRIPTION}</p>
                  </div>
                  {!readOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        rentalPriceTiers.append({
                          minDays: 0,
                          dailyPrice: 0,
                          sortOrder: rentalPriceTiers.fields.length,
                        })
                      }
                    >
                      <IconPlus className="mr-1.5 size-4" />
                      {text.FORM.ADD_PRICE_TIER}
                    </Button>
                  )}
                </div>

                {rentalPriceTiers.fields.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{text.FORM.RENTAL_PRICE_TIERS_EMPTY}</p>
                ) : (
                  <div className="space-y-3">
                    {rentalPriceTiers.fields.map((tier, index) => (
                      <div
                        key={tier.id}
                        className="grid gap-3 rounded-md border p-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]"
                      >
                        <Controller
                          control={form.control}
                          name={`rentalPriceTiers.${index}.minDays`}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={field.name}>{text.FORM.MIN_DAYS}</FieldLabel>
                              <Input
                                {...field}
                                id={field.name}
                                aria-invalid={fieldState.invalid}
                                type="number"
                                min={0}
                                disabled={readOnly}
                              />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />
                        <Controller
                          control={form.control}
                          name={`rentalPriceTiers.${index}.maxDays`}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={field.name}>{text.FORM.MAX_DAYS}</FieldLabel>
                              <Input
                                {...field}
                                id={field.name}
                                aria-invalid={fieldState.invalid}
                                type="number"
                                min={1}
                                disabled={readOnly}
                              />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />
                        <Controller
                          control={form.control}
                          name={`rentalPriceTiers.${index}.dailyPrice`}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={field.name}>{text.FORM.TIER_DAILY_PRICE}</FieldLabel>
                              <CurrencyInput
                                {...field}
                                id={field.name}
                                aria-invalid={fieldState.invalid}
                                disabled={readOnly}
                              />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />
                        <Controller
                          control={form.control}
                          name={`rentalPriceTiers.${index}.name`}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={field.name}>{text.FORM.TIER_NAME}</FieldLabel>
                              <Input
                                {...field}
                                id={field.name}
                                aria-invalid={fieldState.invalid}
                                placeholder={text.FORM.TIER_NAME_PLACEHOLDER}
                                disabled={readOnly}
                              />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />
                        {!readOnly && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="self-end"
                            onClick={() => rentalPriceTiers.remove(index)}
                          >
                            <IconTrash className="size-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{text.FORM.DESCRIPTION}</FieldLabel>
                    <Textarea {...field} placeholder={text.FORM.DESCRIPTION_PLACEHOLDER} disabled={readOnly} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={form.control}
                  name="includedAccessories"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{text.FORM.INCLUDED_ACCESSORIES}</FieldLabel>
                      <Textarea
                        placeholder={text.FORM.INCLUDED_ACCESSORIES_PLACEHOLDER}
                        disabled={readOnly}
                        {...field}
                        value={field.value ?? ''}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="usageGuide"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>{text.FORM.USAGE_GUIDE}</FieldLabel>
                      <Textarea
                        placeholder={text.FORM.USAGE_GUIDE_PLACEHOLDER}
                        disabled={readOnly}
                        {...field}
                        value={field.value ?? ''}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <Controller
                control={form.control}
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
          </ScrollArea>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {text.DIALOG.CANCEL}
            </Button>
            {!readOnly && (
              <Button type="submit" form="product-form" disabled={isPending}>
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

function ProductDeleteConfirmDialog({
  open,
  onOpenChange,
  products,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: IProductOut[];
  onSuccess?: () => void;
}) {
  const deleteMutation = useDeleteProducts();
  const text = TITLE_PAGE.PRODUCTS;
  const isMulti = products.length > 1;

  const handleDelete = () => {
    onOpenChange(false);
    deleteMutation.mutate(
      products.map((product) => product.id),
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
          text.DIALOG.DELETE_MULTI_DESCRIPTION.replace('{count}', String(products.length))
        ) : (
          <>
            {text.DIALOG.DELETE_SINGLE_PREFIX} <strong>{products[0]?.name}</strong>?
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

function ProductStatusConfirmDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: IProductOut;
}) {
  const mutation = useUpdateProductStatus();
  const text = TITLE_PAGE.PRODUCTS;
  const nextActive = !product.isActive;

  const handleConfirm = () => {
    onOpenChange(false);
    mutation.mutate({ id: product.id, data: { isActive: nextActive } });
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={nextActive ? text.DIALOG.STATUS_ENABLE_TITLE : text.DIALOG.STATUS_DISABLE_TITLE}
      desc={
        <>
          {text.DIALOG.STATUS_DESCRIPTION_PREFIX}{' '}
          {nextActive ? text.ACTIONS.ENABLE.toLowerCase() : text.ACTIONS.DISABLE.toLowerCase()}{' '}
          <strong>{product.name}</strong>?
        </>
      }
      confirmText={nextActive ? text.ACTIONS.ENABLE : text.ACTIONS.DISABLE}
      cancelBtnText={text.DIALOG.CANCEL}
      destructive={!nextActive}
      handleConfirm={handleConfirm}
    />
  );
}

export function ProductDialogs({ table }: { table: Table<IProductOut> }) {
  const { open, setOpen, currentRow, setCurrentRow } = useProducts();

  const closeDialog = () => {
    setOpen(null);
    setTimeout(() => setCurrentRow(null), 300);
  };
  const isFormOpen = open === 'view' || open === 'edit';
  const readOnly = open === 'view';

  return (
    <>
      <ProductFormDialog
        key="product-add"
        open={open === 'add'}
        onOpenChange={(nextOpen) => (nextOpen ? setOpen('add') : closeDialog())}
      />
      <ProductDeleteConfirmDialog
        open={open === 'delete-multi'}
        onOpenChange={(nextOpen) => (nextOpen ? setOpen('delete-multi') : closeDialog())}
        products={table.getFilteredSelectedRowModel().rows.map((row) => row.original)}
        onSuccess={() => table.resetRowSelection()}
      />
      {currentRow && (
        <>
          <ProductFormDialog
            key={`product-form-${currentRow.id}`}
            open={isFormOpen}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen(readOnly ? 'view' : 'edit') : closeDialog())}
            currentRow={currentRow}
            readOnly={readOnly}
          />
          <ProductStatusConfirmDialog
            key={`product-status-${currentRow.id}`}
            open={open === 'status'}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen('status') : closeDialog())}
            product={currentRow}
          />
          <ProductDeleteConfirmDialog
            open={open === 'delete'}
            onOpenChange={(nextOpen) => (nextOpen ? setOpen('delete') : closeDialog())}
            products={[currentRow]}
          />
        </>
      )}
    </>
  );
}
