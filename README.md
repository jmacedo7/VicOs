# VicOs

**VicOs — Your Business Operating System**

One company. One system.

**Produção:** https://vicos.vercel.app

O VicOs é um SaaS multiempresa para centralizar operação, contatos, contas, financeiro, equipe, documentos, tarefas, sincronização, histórico e comunicação em um único ambiente.

## Stack
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase / PostgreSQL
- Supabase Auth + RLS + Realtime
- Vercel
- GitHub

## Marca
O nome oficial do produto é **VicOs**, com o **O em maiúsculo**.

## Copyright
© 2026 D7 Studio and João Macedo. Todos os direitos reservados.

## Funcionalidades implementadas
- E-mail/senha e Google OAuth.
- Multi-tenant isolado por `company_id` com RLS.
- Contatos, contas, financeiro, equipe, histórico e personalização.
- Chat privado E2EE no navegador com ECDH P-256 + AES-GCM.
- Documentos compartilhados com Realtime, controle de concorrência por versão e histórico.
- Tarefas compartilhadas com status, prioridade, responsável, prazo e Realtime.
- OAuth de Gmail e Microsoft/Outlook.
- Tokens de e-mail cifrados no servidor com AES-256-GCM.
- Proteção de rotas e RBAC.

## Variáveis de ambiente
Use `.env.example`. Para OAuth de e-mail, configure:
`NEXT_PUBLIC_SITE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` e `EMAIL_TOKEN_ENCRYPTION_KEY`.

## Redirects OAuth
Para login social do VicOs, configure o callback:
`https://vicos.vercel.app/auth/callback`

No Google Cloud, o **Authorized redirect URI** deve continuar sendo o callback do Supabase:
`https://muzopxphnxzxszkgpxoq.supabase.co/auth/v1/callback`

No Google Cloud para o fluxo de Gmail/Google Workspace, cadastre:
`https://vicos.vercel.app/api/integrations/google/callback`

No Microsoft Entra, cadastre:
`https://vicos.vercel.app/api/integrations/microsoft/callback`

O login social do VicOs usa Supabase Auth + Authorization Code/PKCE e o callback final permanece no domínio canônico.

## Deploy
1. Configure o projeto Vercel ligado ao repositório.
2. Configure todas as variáveis de produção.
3. Configure os redirects do Supabase Auth e dos provedores OAuth.
4. Faça deploy de preview e execute o QA de login, multi-tenancy, chat, documentos, tarefas e OAuth.
5. Promova a versão validada para produção.

## Segurança
O service role é usado apenas em código de servidor. Tokens de e-mail nunca são retornados ao cliente. RLS fica ativo nas tabelas públicas e o Realtime respeita o isolamento do Supabase.

© 2026 D7 Studio and João Macedo. Todos os direitos reservados.
