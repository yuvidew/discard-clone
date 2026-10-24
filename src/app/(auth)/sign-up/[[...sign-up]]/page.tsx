import { SignUp } from "@clerk/nextjs";

import { requireUnAuth } from "@/lib/auth-utils";

/**
 * @component SignUpPage
 * @description Renders Clerk's prebuilt sign-up form; signed-in users are redirected home.
 */
const SignUpPage = async () => {
  await requireUnAuth();
  return <SignUp />;
};

export default SignUpPage;
