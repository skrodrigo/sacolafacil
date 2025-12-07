# 🛒 Listinha - Shopping List Manager

Um aplicativo mobile completo para gerenciar listas de compras com orçamento, histórico e relatórios. Desenvolvido com **React Native**, **Hono**, **Prisma** e **Better Auth**.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Desenvolvimento](#desenvolvimento)
- [Deploy na Vercel](#deploy-na-vercel)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API Endpoints](#api-endpoints)
- [Tecnologias](#tecnologias)

---

## 🎯 Visão Geral

**Listinha** é um aplicativo que permite:

- ✅ **Criar listas de compras** com orçamento definido
- ✅ **Adicionar itens** com quantidade e valor
- ✅ **Acompanhar gastos** em tempo real
- ✅ **Visualizar histórico** de compras anteriores
- ✅ **Gerar relatórios** com resumo de gastos
- ✅ **Autenticação segura** com email e senha
- ✅ **Sincronização** entre dispositivos

---

## 🏗️ Arquitetura

```
Listinha/
├── backend/                    # Servidor Hono + Prisma
│   ├── src/
│   │   ├── api/               # Módulos da API (rotas, controllers, DTOs)
│   │   ├── common/            # Utilitários (env, logger, prisma)
│   │   ├── middlewares/       # Middlewares (auth, error-handler)
│   │   ├── models/            # Schemas e tipos de dados (Zod)
│   │   ├── services/          # Lógica de negócio
│   │   └── server.ts          # Ponto de entrada da aplicação
│   ├── prisma/
│   │   └── schema.prisma      # Schema do banco de dados
│   └── package.json
│
└── mobile/                     # App React Native (Expo)
    # ... (estrutura do mobile)
```

---

## 📦 Pré-requisitos

- **Node.js** (v18 ou superior)
- **npm** ou **yarn**
- **Vercel CLI** (para deploy)

---

## 🚀 Instalação e Desenvolvimento

### Backend

1.  **Navegue até a pasta do backend:**
    ```bash
    cd backend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Copie `.env.example` para `.env` e preencha os valores.
    ```bash
    cp .env.example .env
    ```

4.  **Execute as migrations do banco de dados:**
    ```bash
    npm run db:migrate
    ```

5.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    O servidor estará disponível em `http://localhost:3000`.
    A documentação Swagger estará em `http://localhost:3000/swagger`.

### Mobile

(Instruções para o mobile permanecem as mesmas)

---

## ☁️ Deploy na Vercel

Este projeto está configurado para deploy na **Vercel** usando o **Node.js Runtime**.

### 1. Configuração do Projeto na Vercel

- **Framework Preset:** `Other`
- **Build Command:** `cd backend && npm install && npm run build`
- **Start Command:** `cd backend && npm start`
- **Output Directory:** `backend/dist`
- **Install Command:** `npm install --prefix=backend`

### 2. Scripts de Deploy

O `package.json` do backend inclui os seguintes scripts para produção:

-   `"build": "tsc && tsc -p tsconfig.build.json"`: Compila o código TypeScript para JavaScript.
-   `"start": "NODE_ENV=production node dist/server.js"`: Inicia o servidor em modo de produção.
-   `"db:migrate:prod": "prisma migrate deploy"`: Aplica as migrations em um ambiente de produção.

### 3. Arquivo `vercel.json`

Para garantir que o Hono funcione corretamente na Vercel, crie um arquivo `vercel.json` na raiz do projeto com o seguinte conteúdo:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/backend/dist/server.js" }
  ]
}
```

---

## 📁 Estrutura do Projeto (Detalhada)

### Backend - `backend/src/`

-   **`api/`**: Contém os módulos de cada feature da API.
    -   `*.routes.ts`: Define os endpoints, schemas de validação e anexa os controllers.
    -   `*.controller.ts`: Orquestra as chamadas aos serviços e formata a resposta.
-   **`common/`**: Utilitários compartilhados.
    -   `env.ts`: Validação e tipagem de variáveis de ambiente com Zod.
    -   `prisma.ts`: Configuração do cliente Prisma.
-   **`middlewares/`**: Middlewares do Hono.
    -   `auth.middleware.ts`: Valida a sessão do usuário.
    -   `error-handler.middleware.ts`: Captura e formata erros.
-   **`models/`**: Schemas de dados (Zod) e tipos TypeScript.
-   **`services/`**: Lógica de negócio e acesso ao banco de dados.
-   **`server.ts`**: Ponto de entrada da aplicação, onde os middlewares e rotas são registrados.

(O restante da estrutura e seções permanecem relevantes)
