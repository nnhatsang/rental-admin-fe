export type DirtyFieldsType =
  | boolean
  | null
  | undefined
  | {
      [key: string]: DirtyFieldsType;
    }
  | DirtyFieldsType[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDirtyValues<T extends Record<string, any>>(
  dirtyFields: Partial<Record<keyof T, DirtyFieldsType>>,
  values: T,
): Partial<T> {
  return Object.keys(dirtyFields).reduce((result, key) => {
    const dirty = dirtyFields[key];

    if (!dirty) {
      return result;
    }

    if (typeof dirty === 'object' && dirty !== null && !Array.isArray(dirty)) {
      result[key as keyof T] = getDirtyValues(dirty as Record<string, DirtyFieldsType>, values[key]) as T[keyof T];
    } else {
      result[key as keyof T] = values[key];
    }

    return result;
  }, {} as Partial<T>);
}




