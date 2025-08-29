import { StytchLogin } from "@stytch/nextjs";
import { Products } from "@stytch/vanilla-js";

const REDIRECT_URL = "http://localhost:3000/authenticate";

export function Login() {
  const config = {
    products: [Products.emailMagicLinks, Products.oauth],
    emailMagicLinksOptions: {
      loginRedirectURL: REDIRECT_URL,
      loginExpirationMinutes: 60,
      signupRedirectURL: REDIRECT_URL,
      signupExpirationMinutes: 60,
    },
    oauthOptions: {
      providers: [
        {
          type: "google",
        },
      ],
    },
  } as any;

  return <StytchLogin config={config} />;
}
