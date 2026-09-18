# VicOs

**VicOs — Your Business Operating System**

One company. One system.

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
Cadastre no Google Cloud:
`https://SEU-DOMINIO/api/integrations/google/callback`

Cadastre no Microsoft Entra:
`https://SEU-DOMINIO/api/integrations/microsoft/callback`

O fluxo usa Authorization Code + `state` em cookie HttpOnly para proteção CSRF.

## Deploy
1. Configure o projeto Vercel ligado ao repositório.
2. Configure todas as variáveis de produção.
3. Configure os redirects do Supabase Auth e dos provedores OAuth.
4. Faça deploy de preview e execute o QA de login, multi-tenancy, chat, documentos, tarefas e OAuth.
5. Promova a versão validada para produção.

## Segurança
O service role é usado apenas em código de servidor. Tokens de e-mail nunca são retornados ao cliente. RLS fica ativo nas tabelas públicas e o Realtime respeita o isolamento do Supabase.

© 2026 D7 Studio and João Macedo. Todos os direitos reservados.
