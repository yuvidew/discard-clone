"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * @component ThemeProvider
 * @description Client wrapper around next-themes so the root layout (a server component) can supply light/dark theme state.
 */
export const ThemeProvider = ({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) => (
  <NextThemesProvider {...props}>{children}</NextThemesProvider>
);
