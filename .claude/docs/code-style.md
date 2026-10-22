# Code style

Full rules for hand-written `.ts`/`.tsx` files. `CLAUDE.md` links here; read this before writing or editing any such file.

## 1. Function/component declaration style

Use `const` + arrow functions everywhere. Never use `function` declarations in hand-written code.

| What you're writing | Style |
|---|---|
| React component | `const` + arrow, exported directly |
| Custom hook | `const` + arrow, exported directly |
| Plain helper/utility function | `const` + arrow |
| Default-exported page/layout component | named `const` first, then `export default` |
| Next.js route handler (`app/api/**/route.ts`) | `const` + arrow, exported directly |
| Inline/anonymous (event handlers, `.map`/`.filter`, `useEffect`/`useState` bodies) | arrow function |

```tsx
// Component
export const NavUser = () => { ... };

// Hook
export const useIsMobile = () => { ... };

// Helper
const getInitials = (name: string) => { ... };

// Default-exported page: name it first, then export.
const Page = () => { ... };
export default Page;

// Route handler
export const POST = async (req: NextRequest) => { ... };
```

### Exception: `components/ui/`

This folder is shadcn CLI output (`function ComponentName(props) { ... }`). **Never convert it.** Leave it in generated style so future `npx shadcn add` / updates don't overwrite or diverge. The comment rules below also don't apply there.

## 2. Comment style

The codebase has historically been under-commented. Every new component, hook, function, and non-obvious variable carries a short comment explaining intent, not restating the code.

### Components: JSDoc block with `@` tags

```tsx
/**
 * @component NavUser
 * @description Renders the signed-in user's avatar and account dropdown in the sidebar footer.
 */
export const NavUser = () => { ... };
```

Add `@param` for non-trivial props when it clarifies usage.

### Hooks, functions, important variables: one `//` line above

State *why* / *what*, not the syntax.

```ts
// Tracks whether the viewport is below the mobile breakpoint.
export const useIsMobile = () => { ... };

// Extracts up to two initials from a full name for the avatar fallback.
const getInitials = (name: string) => { ... };

// Debounce timer id; cleared on unmount to avoid a stray state update.
const timeoutRef = useRef<NodeJS.Timeout>();
```

### Skip comments for

- Self-evident locals (loop indices, trivial destructures).
- Generated code under `components/ui/`.

## 3. Using custom hooks: destructure the result

When a component reads more than one value from a hook (custom hooks and TanStack `useMutation`/`useQuery` wrappers alike), destructure the return value instead of storing it in one variable and reaching in with `hook.x` / `hook.y`.

Rename with `:` whenever one component uses several hooks that expose the same key (`mutate`, `isPending`, `variables`, `data`), so names stay unambiguous.

```tsx
// Wrong: one object, then dotted access.
const deleteServer = useDeleteServer();
deleteServer.mutate(id);
<Button disabled={deleteServer.isPending} />

// Right: destructure and rename to say what each value is.
const { mutate: deleteServer, isPending: isDeleting } = useDeleteServer();
deleteServer(id);
<Button disabled={isDeleting} />

const { open: openModal, bind } = useModal<ServerModalType>();
const { data, isPending, isError } = useGetMembers(serverId, open);
```

**Exception:** a hook that returns a single handle passed around whole (`const form = useForm(...)` with `form.control` / `form.handleSubmit` used throughout, or `useQueryClient()`) may stay as one variable.

## 4. Reusable code: don't repeat yourself

Write each piece of logic or UI once and reuse it. Before writing anything new, search the repo for something that already does the job.

- **Search first.** Check `components/` (outside `ui/`), `hooks/`, `lib/`, and the feature's own folders. Extend or reuse what exists instead of writing a near-duplicate.
- **Extract on the second use.** When the same markup, logic, type, constant or class string appears a second time, pull it into one shared place. Don't copy-paste and tweak.
- **Pick the right home:**

| What repeats | Where it goes |
|---|---|
| Markup used in several places | A component in `components/` (or `features/<feature>/_components/` if feature-only) |
| Stateful or effectful logic | A custom hook in `hooks/` (or `features/<feature>/hook/`) |
| Pure helper (formatting, parsing, mapping) | `lib/` |
| Types shared by several files | `features/<feature>/types.ts` or a shared types file |
| Magic strings/numbers, query keys, option lists | A constants file, exported once |
| Repeated Tailwind class strings or variants | `cn()` with a shared constant, or a `cva` variant |

- **Build on shadcn.** Compose the components in `components/ui/` and wrap them (e.g. a `ConfirmDialog`) rather than rebuilding dialogs, inputs or cards. Never edit `components/ui/` to add app-specific behavior; wrap it.
- **Drive repeated JSX from data.** Render lists, nav items, form fields and table columns by mapping over a config array, not by pasting blocks.
- **Parameterize, don't fork.** If two pieces differ slightly, make one component/function with props or arguments (variants, render props, `children`) instead of two copies.
- **Backend:** reuse the shared `api` axios instance, `getErrorMessage`, and the feature's query-key constants. Don't redefine them per file.
- **Don't over-abstract.** Two similar lines are fine. Extract when the repetition is real and the shared shape is clear, and keep the abstraction as small as the duplication it replaces.

```tsx
// Wrong: the same block pasted per item.
<NavLink href="/servers">Servers</NavLink>
<NavLink href="/friends">Friends</NavLink>
<NavLink href="/settings">Settings</NavLink>

// Right: one definition, driven by data.
const NAV_ITEMS = [
  { href: "/servers", label: "Servers" },
  { href: "/friends", label: "Friends" },
  { href: "/settings", label: "Settings" },
];

NAV_ITEMS.map(({ href, label }) => <NavLink key={href} href={href}>{label}</NavLink>);
```

## 5. Backend calls

TanStack Query + axios layering, query/mutation hook conventions, and route handler rules are in `CLAUDE.md` under "Calling backend APIs". They follow the same `const` + arrow and comment rules above.

## Checklist before finishing a file

- [ ] No `function` declarations outside `components/ui/`.
- [ ] Every new component has a JSDoc block; every new hook/function/non-obvious variable has a `//` line.
- [ ] Multi-value hook results are destructured, with renames where keys collide.
- [ ] Searched for existing components/hooks/helpers first; nothing duplicated, repeated blocks extracted.
