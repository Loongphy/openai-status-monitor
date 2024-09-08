# OpenAI API Provider Status Monitor

> Repeated deployment failures have caused a mental breakdown, and the project is being abandoned. If we continue, it will be re-implemented in React, which I will get better Cursor hints.


## Setup

[nuxt-scheduler](https://github.com/jurassicjs/nuxt-scheduler) does not support nuxthub deployment, so it just works on my machine😅.


Make sure to install the dependencies with [pnpm](https://pnpm.io/installation#using-corepack):

```bash
pnpm install
```

You can update the main text displayed by creating a `.env`:

```bash
NUXT_PUBLIC_HELLO_TEXT="Hello my world!"
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

## Deploy


Deploy the application on the Edge with [NuxtHub](https://hub.nuxt.com) on your Cloudflare account:

```bash
npx nuxthub deploy
```

Then checkout your server logs, analaytics and more in the [NuxtHub Admin](https://admin.hub.nuxt.com).

You can also deploy using [Cloudflare Pages CI](https://hub.nuxt.com/docs/getting-started/deploy#cloudflare-pages-ci).

