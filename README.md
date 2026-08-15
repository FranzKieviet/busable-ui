This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerequisites

- Node.js (recommended: 18.x or later). Check your version with:

```bash
node --version
```
- A package manager: `npm`, `yarn`, `pnpm`, or `bun`.

## Install dependencies

Clone the repo (if you haven't already) and install the project dependencies using your preferred package manager.

```bash
# using npm
npm install

# using yarn
yarn install

# using pnpm
pnpm install

# using bun
bun install
```

If you want a clean, reproducible install on CI or a fresh machine, prefer:

```bash
# npm
npm ci

# pnpm
pnpm install --frozen-lockfile
```

## Run the development server

Start the dev server with one of the following commands:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## Build for production

```bash
npm run build
npm run start
```

## Project notes

- The app entry is under the `app/` directory — edit `app/page.tsx` (or `app/page.js`) to modify the homepage.
- Styling and theme code live in `src/theme.ts` and `app/globals.css`.

## Learn more

For more about Next.js features and deployment, see:

- [Next.js Documentation](https://nextjs.org/docs)
- [Deploy on Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)

---

If you'd like, I can also add a short troubleshooting section (common errors, Node version manager instructions, or commands for installing `pnpm`/`yarn`).
