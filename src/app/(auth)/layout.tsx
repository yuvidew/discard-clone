import { Suspense, type ReactNode } from "react";

/**
 * @component AuthLayout
 * @description Centers the Clerk sign-in / sign-up forms; the Suspense boundary lets the pages read the session at request time without blocking prerender.
 */
const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense>{children}</Suspense>
    </div>
  );
};

export default AuthLayout;
