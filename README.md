# 🛒 Sacola Fácil - Gerenciador de Listas de Compras

Um aplicativo mobile completo para gerenciar listas de compras com orçamento.

---

## 📋 Índice

- [Tecnologias](#-tecnologias)
- [Arquitetura do Backend](#-arquitetura-do-backend)
- [Pré-requisitos](#-pré-requisitos)
- [Como Executar](#-como-executar)
- [Scripts Disponíveis](#-scripts-disponíveis)

---

## 🛠️ Tecnologias

| Categoria         | Tecnologia                               |
| ----------------- | ---------------------------------------- |
| **Backend**       | Hono, Node.js, TypeScript, Prisma, PostgreSQL, Zod, JWT, bcrypt |
| **Mobile**        | React Native, Expo, TypeScript, NativeWind, TanStack Query |
| **Banco de Dados**  | PostgreSQL                               |

---

## 🏗️ Arquitetura do Backend

O backend segue uma arquitetura em camadas para garantir a separação de responsabilidades e a manutenibilidade.

-   **`routes/`**: Define os endpoints da API, valida as requisições com Zod e chama os serviços. É a camada de entrada HTTP.
-   **`services/`**: Contém a lógica de negócio principal. Orquestra as chamadas aos repositórios e não conhece nada sobre HTTP.
-   **`repositories/`**: Camada de acesso a dados. É a única que interage diretamente com o Prisma para consultas ao banco de dados.
-   **`middlewares/`**: Middlewares do Hono, como o `auth.middleware.ts` que valida os tokens JWT.
-   **`dtos/`**: Data Transfer Objects. Contém os schemas Zod para validação e os tipos TypeScript inferidos.
-   **`common/`**: Utilitários compartilhados, como a configuração do Prisma e a validação de variáveis de ambiente.

```
backend/src/
├── common/         # Configs (env, prisma)
├── dtos/           # Schemas de validação (Zod)
├── middlewares/    # Middlewares (auth, error)
├── repositories/   # Acesso a dados (Prisma)
├── routes/         # Definição de rotas (Hono)
├── services/       # Lógica de negócio
└── server.ts       # Ponto de entrada do servidor
```

---

## 📦 Pré-requisitos

-   **Node.js** (v18 ou superior)
-   **npm** ou **yarn**
-   **Docker** e **Docker Compose** (para o banco de dados PostgreSQL)

---

## 🚀 Como Executar

### 1. Backend

1.  **Navegue até a pasta do backend:**
    ```bash
    cd backend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Copie o arquivo `.env.example` para `.env` e preencha os valores. O `JWT_SECRET` pode ser gerado com o comando `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
    ```bash
    cp .env.example .env
    ```

4.  **Inicie o banco de dados com Docker:**
    ```bash
    npm run db:up
    ```

5.  **Execute as migrations do Prisma:**
    Isso criará as tabelas no seu banco de dados.
    ```bash
    npm run db:migrate
    ```

6.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

O servidor estará disponível em `http://localhost:3000`.
A documentação da API (Swagger UI) estará em `http://localhost:3000/swagger`.

### 2. Mobile

1.  **Navegue até a pasta do mobile:**
    ```bash
    cd mobile
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Atualize o IP do Backend:**
    No arquivo `src/infra/api.ts`, certifique-se de que o `baseURL` aponta para o endereço IP da sua máquina na rede local (ex: `http://192.168.1.10:3000`).

4.  **Inicie o Expo:**
    ```bash
    npm start
    ```

5.  Escaneie o QR code com o aplicativo **Expo Go** no seu celular.

---

## 📜 Scripts Disponíveis (Backend)

-   `npm run dev`: Inicia o servidor em modo de desenvolvimento com hot-reload.
-   `npm run build`: Compila o código TypeScript para produção.
-   `npm run start`: Inicia o servidor em modo de produção.
-   `npm run db:up`: Inicia o container do PostgreSQL com Docker Compose.
-   `npm run db:down`: Para o container do PostgreSQL.
-   `npm run db:migrate`: Aplica as migrations do Prisma.
-   `npm run db:studio`: Abre o Prisma Studio para visualizar e editar os dados.