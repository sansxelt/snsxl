# Nishanth Dasari portfolio

Password-protected Next.js portfolio for the existing `snsxl` Vercel project. The site retains its animated 18-chapter layout, motion preferences, chapter navigation and private owner visit log.

## Local development

```sh
npm ci
node scripts/generate-access-env.mjs
npm run dev
```

Copy the generated access values into an untracked `.env.local`. Never commit this file or paste its contents into public issues. The required access variables are `ACCESS_PASSWORD_SALT`, `ACCESS_PASSWORD_HASH` and `ACCESS_TOKEN_KEY`. Keep the existing production values to preserve the password and existing access cookies.

## Build and deployment

```sh
npm run build
npm start
```

Deploy through the connected `sansxelt/snsxl` Git repository and existing Vercel `snsxl` project. Keep the repository private if the portfolio text should remain private. Vercel production configuration supplies access variables, the private `BLOB_READ_WRITE_TOKEN` and `OWNER_KEY_SHA256`; they are not stored in this repository.

The visit log records successful acknowledged unlocks only in Vercel production. Local development and preview deployments never write to it. The `/visits` route requires the owner's existing key and returns 404 without it.

DM Sans font files are stored locally in `public/fonts`. The 3D scene is generated procedurally and does not depend on the original large `public` asset folder.
