export function getDirtyValues<T extends Record<string, unknown>>(
  values: T,
  dirtyFields: Partial<Record<keyof T, boolean>>,
): Partial<T> {
  return Object.keys(dirtyFields).reduce((acc, key) => {
    acc[key as keyof T] = values[key as keyof T];
    return acc;
  }, {} as Partial<T>);
}
