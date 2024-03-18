This is a multi generative AIs application.

The program is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) and integrated with [`AI SDK`](https://github.com/vercel/ai). 

You can chat with AIs from several different platforms such as OpenAI, Google, Cohere, Fireworks.ai, Hugging Face, AWS Bedrock, Mistral, Groq, Perplexity, and Anthropic. Some models accept image recognitions and image generations.

## Getting Started

Create `.env.local` and configure several API_KEYs from `.env.example`.

Run the development server:

```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can build to see lint errors on production environment.

```bash
pnpm build
```

## Deployment

As the program uses edge functions, it is intended to deploy to [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftwxxk%2Fmulai3&env=OPENAI_API_KEY,GOOGLE_API_KEY,ANTHROPIC_API_KEY&envDescription=See%20.env.example%20for%20other%20environment%20variable&demo-title=Mulai&demo-url=https%3A%2F%2Fmulai.vercel.app%2F)

## Reference

I created a brother project [`Mulai3`](https://github.com/twxxk/mulai3) which utilizes more React Server Components and function calls. You might also want to review it.
