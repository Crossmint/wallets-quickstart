

<div align="center">
<img width="200" alt="Image" src="https://github.com/user-attachments/assets/8b617791-cd37-4a5a-8695-a7c9018b7c70" />
<br>
<br>
<h1>Wallets Quickstart</h1>

<div align="center">
<a href="https://wallets.demos-crossmint.com/">Live Demo</a> | <a href="https://docs.crossmint.com/introduction/platform/wallets">Docs</a> | <a href="https://www.crossmint.com/quickstarts">See all quickstarts</a>
</div>

<br>
<br>
</div>

## Introduction
Create and interact with Crossmint wallets. This quickstart uses Crossmint Auth and uses your email as a signer for that wallet.

**Learn how to:**
- Create a wallet
- View its balance for USDXM and native tokens
- View wallet transaction activity
- Send USDXM or native tokens to another wallet

## Deploy
Easily deploy the template to Vercel with the button below. You will need to set the required environment variables in the Vercel dashboard.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FCrossmint%2Fwallets-quickstart&env=NEXT_PUBLIC_CROSSMINT_API_KEY)

## Setup
1. Clone the repository and navigate to the project folder:
```bash
git clone https://github.com/crossmint/wallets-quickstart.git && cd wallets-quickstart
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

4. Get a Crossmint client API key from [here](https://docs.crossmint.com/introduction/platform/api-keys/client-side) and add it to the `.env` file. Make sure your API key has the following scopes: `users.create`, `users.read`, `wallets.read`, `wallets.create`, `wallets:transactions.create`, `wallets:transactions.sign`, `wallets:balance.read`, `wallets.fund`.
```bash
NEXT_PUBLIC_CROSSMINT_API_KEY=your_api_key
```

5. Run the development server:
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
1. Create a [production API key](https://docs.crossmint.com/introduction/platform/api-keys/client-side).`
