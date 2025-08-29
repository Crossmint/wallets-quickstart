

<div align="center">
<img width="200" alt="Image" src="https://github.com/user-attachments/assets/8b617791-cd37-4a5a-8695-a7c9018b7c70" />
<br>
<br>
<h1>Wallets Quickstart with Stytch</h1>

<div align="center">
<a href="https://wallets.demos-crossmint.com/">Live Demo</a> | <a href="https://docs.crossmint.com/introduction/platform/wallets">Docs</a> | <a href="https://www.crossmint.com/quickstarts">See all quickstarts</a>
</div>

<br>
<br>
</div>

## Introduction
Create and interact with Crossmint wallets. This quickstart uses [Stytch Auth](https://stytch.com/) and uses your email as a signer for that wallet.

**Learn how to:**
- Create a wallet
- View its balance for USDXM (USDXM is a test stablecoin by Crossmint) and native tokens
- View wallet transaction activity
- Send USDXM or native tokens to another wallet

## Setup
1. Clone the repository and navigate to the project folder:
```bash
git clone https://github.com/crossmint/wallets-quickstart.git && cd wallets-quickstart
git fetch --all
git checkout stytch-auth
```

2. Install all dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up the environment variables:
```bash
cp .env.template .env
```

4. Get a Crossmint client API key from [here](https://docs.crossmint.com/introduction/platform/api-keys/client-side) and add it to the `.env` file. Make sure your API key has the following scopes: `wallets.read`, `wallets.create`, `wallets:transactions.create`, `wallets:transactions.sign`, `wallets:balance.read`, `wallets.fund`.
```bash
NEXT_PUBLIC_CROSSMINT_API_KEY=your_api_key

# Check all supported chains: https://docs.crossmint.com/introduction/supported-chains
NEXT_PUBLIC_CHAIN=your_chain
```

5. Create a Stytch project, enable a frontend SDK and get the public token for it.
```bash
NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN=your_public_token
```

6. In the Crossmint console go to [API keys](https://console.crossmint.com/api-keys) and [set third party authentication](https://docs.crossmint.com/introduction/platform/api-keys/jwt-authentication#third-party-authentication) to `Stytch` with your Stytch public token.

7. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Using in production
1. Create a [production API key](https://docs.crossmint.com/introduction/platform/api-keys/client-side).
2. Set up Stytch for production and repeat steps 5 and 6 above in your production environment.
