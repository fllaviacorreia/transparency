<div align="center">

# 🔍 Transparency

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-11-DD2C00?style=for-the-badge&logo=firebase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Components-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![License](https://img.shields.io/badge/License-Private-red?style=for-the-badge)

**Plataforma de transparência financeira para projetos**

</div>

---

## 📋 Sobre o Projeto

O **Transparency** é uma plataforma web completa voltada para a **gestão financeira transparente de projetos**. Pensado para freelancers, pequenas equipes e organizações que precisam prestar contas de forma clara e acessível, o sistema permite registrar todas as movimentações financeiras — entradas e saídas — com comprovantes anexados, e disponibilizar essas informações publicamente através de um código de acesso único.

Qualquer pessoa com o código do projeto pode consultar as movimentações na página pública de transparência, sem necessidade de cadastro. Já na área autenticada (dashboard), o gestor tem controle total: cria projetos, registra transações, anexa e edita comprovantes, visualiza gráficos e compartilha o acesso público.

## 🚀 Tecnologias

| Tecnologia | Descrição |
|---|---|
| ⚡ [Next.js 16](https://nextjs.org) | Framework React com App Router e Server Components |
| 🔷 [TypeScript](https://www.typescriptlang.org) | Tipagem estática para maior segurança no código |
| 🎨 [Tailwind CSS 4](https://tailwindcss.com) | Estilização utilitária e responsiva |
| 🧩 [shadcn/ui](https://ui.shadcn.com) | Componentes acessíveis, customizáveis e elegantes |
| 🤖 [v0](https://v0.dev) | Geração de interfaces com inteligência artificial |
| 🔥 [Firebase](https://firebase.google.com) | Auth, Firestore (banco de dados) e Storage (arquivos) |
| ▲ [Vercel](https://vercel.com) | Deploy contínuo e hospedagem otimizada |
| 📊 [Recharts](https://recharts.org) | Gráficos interativos no dashboard |
| 📧 [Nodemailer](https://nodemailer.com) | Envio de e-mails transacionais |

## ✨ Funcionalidades

- 🔐 **Autenticação completa** — Cadastro, login, recuperação de senha via Firebase Auth
- 📁 **Gestão de projetos** — Crie até 5 projetos financeiros com código público único
- 💰 **Registro de transações** — Entradas e saídas com valor, método de pagamento e descrição
- 📎 **Comprovantes** — Upload de imagens (JPG, PNG, WebP) e PDFs como comprovante
- ✏️ **Editor de imagens** — Edite comprovantes com desenho (lápis + cores), blur e corte direto no navegador
- 🌐 **Página pública de transparência** — Qualquer pessoa consulta movimentações pelo código do projeto
- 📊 **Dashboard com gráficos** — Resumo financeiro visual com entradas, saídas e saldo
- 🔗 **Compartilhamento** — Gere links e QR codes para compartilhar o acesso público
- 🌙 **Tema claro/escuro** — Interface adaptável à preferência do usuário
- 📱 **Responsivo** — Funciona em desktop, tablet e celular
- 📬 **E-mails transacionais** — Boas-vindas, notificação de login e recuperação de senha

## 🏗️ Estrutura do Projeto

```
app/
├── api/auth/          # Rotas de API (e-mails transacionais)
├── dashboard/         # Área autenticada (gestão)
├── login/             # Página de login
├── recuperar-senha/   # Recuperação de senha
├── redefinir-senha/   # Redefinição de senha
└── transparencia/     # Página pública de consulta
components/
├── dashboard/         # Componentes do dashboard
├── landing/           # Componentes da landing page
└── ui/                # Componentes shadcn/ui
contexts/              # Context API (autenticação)
hooks/                 # Hooks customizados
lib/                   # Firebase, utilitários, e-mail
types/                 # Tipos TypeScript
```

## 🚀 Primeiros Passos

### 📦 Instalação

```bash
# Clone o repositório
git clone <url-do-repositório>
cd transparency

# Instale as dependências
bun install
```

### ⚙️ Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# 🔥 Firebase (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# 🔐 Firebase Admin (Server)
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# 📧 E-mail (SMTP)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USERNAME=seu_email@example.com
MAIL_PASSWORD=sua_senha
MAIL_FROM="Transparency <noreply@example.com>"

# 🌐 Projeto
PROJECT_URL=http://localhost:3000
```

### ▶️ Executando

```bash
# Modo desenvolvimento
bun dev

# Build de produção
bun run build

# Iniciar produção
bun start
```

Acesse [http://localhost:3000](http://localhost:3000) 🎉

## ▲ Deploy

O deploy é feito automaticamente na **[Vercel](https://vercel.com)**:

1. Conecte o repositório na Vercel
2. Configure as variáveis de ambiente no painel
3. Deploy automático a cada push 🚀

---

<div align="center">

Feito com ❤️ usando Next.js, Firebase e shadcn/ui

</div>
