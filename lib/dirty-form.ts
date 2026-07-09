export function getDirtyValues<T extends Record<string, unknown>>(
  values: T,
  dirtyFields: Partial<Record<keyof T, boolean | Record<string, unknown> | unknown[]>>,
): Partial<T> {
  return Object.entries(dirtyFields).reduce((acc, [key, isDirty]) => {
    if (!isDirty) return acc;

    acc[key as keyof T] = values[key as keyof T];
    return acc;
  }, {} as Partial<T>);
}
