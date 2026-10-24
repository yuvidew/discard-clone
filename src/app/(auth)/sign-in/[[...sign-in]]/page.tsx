import { SignIn } from "@clerk/nextjs";

import { requireUnAuth } from "@/lib/auth-utils";

/**
 * @component SignInPage
 * @description Renders Clerk's prebuilt sign-in form; signed-in users are redirected home.
 */
const SignInPage = async () => {
  await requireUnAuth();
  return <SignIn />;
};

export default SignInPage;
