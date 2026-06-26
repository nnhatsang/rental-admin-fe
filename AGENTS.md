<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Notes

## Project Direction

This frontend is the admin UI for an internal rental management system.

Phase 1 is admin-first. Build screens and flows for internal admins/staff. Do not introduce customer checkout, cart, guest session, payment gateway callback, or customer self-service order flows unless explicitly requested.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- React Hook Form
- Zod
- TanStack Query
- Zustand
- Axios
- Sonner toast
- Shadcn-style UI components under `components/ui`

## Feature Logic Flow

When adding or updating a feature flow, build the logic in this order:

1. Types
2. Schema
3. Service
4. Hook
5. Component/Page

Do not start by putting API calls or validation directly in components.

Recommended structure (feature modularization):

```txt
modules/<domain>/types.ts
modules/<domain>/schema.ts
modules/<domain>/services.ts
modules/<domain>/store.ts
modules/<domain>/hooks/use<Action>.hook.ts
modules/<domain>/components/<Feature>.tsx
app/<route>/page.tsx
```

## Types

Define request/response interfaces in `modules/<domain>/types.ts`.

Use names that match the action:

```ts
export interface ILoginReq {
  email: string;
  password: string;
}

export interface IAuthRes {
  user: IUser;
}
```

Do not type API request bodies inline inside services or hooks if the shape is reused.

## Zod Schemas

Input validation belongs in `modules/<domain>/schema.ts`.

Each schema should export both the schema and inferred input type:

```ts
export const loginSchema = z.object({
  email: z.string().min(1, { message: '...' }).email({ message: '...' }),
  password: z.string().min(1, { message: '...' }),
});

export type ILoginInput = z.infer<typeof loginSchema>;
```

Schema types are for form input. Service request types are for API payloads. They can match, but do not assume they always will.

For confirm fields, make the refine path match the frontend field name:

```ts
path: ['confirmPassword']
```

## Services

Services live in `modules/<domain>/services.ts` and should only describe API calls.

Use `apiClient` for public auth endpoints and unauthenticated requests. Use `apiAuth` for authenticated admin requests.

Services should:

- accept typed request data
- return typed `AxiosResponse<DefaultResponse<T>>`
- avoid toast, router navigation, form state, and UI logic

Example:

```ts
const requestLogin = (data: ILoginReq): Promise<AxiosResponse<DefaultResponse<IAuthRes>>> => {
  const config: AxiosRequestConfig = {
    method: 'POST',
    url: `${url}/login`,
    data,
  };

  return apiClient(config);
};
```

## Hooks

Feature hooks live in `modules/<domain>/hooks/`.

Hooks should connect:

- React Hook Form
- Zod resolver
- TanStack Query mutation/query
- services
- navigation
- toast
- API form error mapping

Use this shape for form mutations:

```ts
export const useLogin = () => {
  const form = useForm<ILoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: ILoginInput) => {
      await requestLogin(values);
    },
    onError: (error) => {
      applyApiFormErrors(form, error, {
        fallbackMessage: ERROR_MESSAGES.AUTH.LOGIN,
      });
    },
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.AUTH.LOGIN);
    },
  });

  const onSubmit = (values: ILoginInput) => {
    mutate(values);
  };

  return {
    form,
    isPending,
    onSubmit,
  };
};
```

## Toast And Message Constants

Do not hardcode toast text inside hooks.

All success toast messages must come from:

```ts
import { SUCCESS_MESSAGES } from '@/utils/consts/messages-success.const';
```

All error fallback messages must come from:

```ts
import { ERROR_MESSAGES } from '@/utils/consts/message-error.const';
```

Required pattern:

```ts
onError: (error) => {
  applyApiFormErrors(form, error, {
    fallbackMessage: ERROR_MESSAGES.AUTH.RESET_PASSWORD,
  });
},
onSuccess: () => {
  toast.success(SUCCESS_MESSAGES.AUTH.RESET_PASSWORD);
},
```

If a feature needs a new message, add it to `ERROR_MESSAGES` and/or `SUCCESS_MESSAGES` first, then import it in the hook.

## API Field Errors

Backend validation errors can be field-based:

```json
{
  "message": "...",
  "code": "INCORRECT_INPUT",
  "error": [
    {
      "property": "password",
      "message": "password must be longer than or equal to 8 characters"
    }
  ]
}
```

Do not manually render backend field errors in components. Use:

```ts
applyApiFormErrors(form, error, {
  fallbackMessage: ERROR_MESSAGES.AUTH.LOGIN,
});
```

If backend field names differ from frontend field names, use `fieldMap`:

```ts
applyApiFormErrors(form, error, {
  fallbackMessage: ERROR_MESSAGES.AUTH.RESET_PASSWORD,
  fieldMap: {
    passwordConfirm: 'confirmPassword',
    newPasswordConfirm: 'confirmPassword',
  },
});
```

## Components And Pages

Components should focus on UI only:

- render form fields
- call `handleSubmit(onSubmit)`
- read `form`, `isPending`, and status flags from hooks
- display `FieldError` from React Hook Form state

Do not call services directly from components.

For field errors:

```tsx
{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
```

For root form errors:

```tsx
{errors.root && <FieldError errors={[errors.root]} />}
```

Pages in `app/**/page.tsx` should normally import and render the feature component only.

## Auth Flow

Current auth routes:

```txt
/auth/login
/auth/forgot-password
/auth/reset-password?token=...
```

Auth form logic should remain in:

```txt
modules/auth/hooks/
modules/auth/schema.ts
modules/auth/services.ts
modules/auth/types.ts
modules/auth/components/
```

Keep the shared auth visual shell in `app/auth/layout.tsx`. Do not duplicate the two-column auth layout inside each auth form component.

## QueryProvider Error Handling

`QueryProvider` handles global query/mutation error toasts only.

Field validation errors with code `INCORRECT_INPUT` should be handled by form hooks through `applyApiFormErrors`, not by global toast.

## Encoding And Text

The UI uses Vietnamese copy. Keep files saved as UTF-8. If existing text is mojibake, fix it when touching that file.

Do not introduce new user-facing strings in hooks when a const should exist in `ERROR_MESSAGES` or `SUCCESS_MESSAGES`.

## Verification

After changing types, schemas, services, hooks, or components, run:

```bash
pnpm exec tsc --noEmit
```

When UI behavior changes, also run the app and verify the route manually.