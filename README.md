# Infrastructure Multi-Family Office

Este projeto é uma aplicação backend desenvolvida com Node.js, TypeScript, Fastify e Prisma. Ele fornece uma API para gerenciar dados relacionados a um escritório multi-familiar.

## Pré-requisitos

Para rodar este projeto, você precisará ter os seguintes softwares instalados em sua máquina:

*   **Node.js**: Versão 20 ou superior. Você pode baixá-lo em [nodejs.org](https://nodejs.org/).
*   **npm** (Node Package Manager): Geralmente vem junto com a instalação do Node.js.
*   **Docker** e **Docker Compose**: Para rodar o banco de dados PostgreSQL e o Adminer em contêineres. Você pode baixá-los em [docker.com](https://www.docker.com/get-started/).
*   **Git**: Para clonar o repositório (se ainda não o fez). Você pode baixá-lo em [git-scm.com](https://git-scm.com/).

## Configuração do Ambiente

### 1. Clonar o Repositório

Se você ainda não tem o projeto em sua máquina, clone-o usando Git:

```bash
git clone https://github.com/Jhopn/Infrastructure-Multi-Family-Office.git
cd Infrastructure-Multi-Family-Office
```

### 2. Instalar Dependências

Navegue até o diretório raiz do projeto e instale as dependências:

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
DATABASE_URL="postgresql://user:password@localhost:5432/database_name?schema=public"
JWT_SECRET="your_jwt_secret_key"
```

**Observações:**
*   `DATABASE_URL`: Altere `user`, `password`, `localhost:5432` e `database_name` conforme a configuração do seu banco de dados PostgreSQL. Se você for usar o `docker-compose.yml` fornecido, os valores padrão serão `user: docker`, `password: docker`, `localhost:5432` e `database_name: multi-family-office-db`.
*   `JWT_SECRET`: Defina uma chave secreta forte para a geração e validação de tokens JWT.

## Rodando o Banco de Dados com Docker Compose

O projeto inclui um arquivo `docker-compose.yml` para facilitar a configuração do banco de dados PostgreSQL e do Adminer (uma ferramenta de gerenciamento de banco de dados).

1.  Certifique-se de que o Docker e o Docker Compose estão em execução.
2.  No diretório raiz do projeto, execute:

    ```bash
    docker-compose up -d
    ```

    Isso iniciará os contêineres do PostgreSQL e do Adminer em segundo plano.

3.  Você pode acessar o Adminer em `http://localhost:8080` para gerenciar seu banco de dados. Use as credenciais configuradas no seu `DATABASE_URL`.

## Configuração do Prisma

Após o banco de dados estar em execução, você precisa gerar o cliente Prisma e aplicar as migrações.

1.  Gerar o cliente Prisma:

    ```bash
    npx prisma generate
    ```

2.  Aplicar as migrações do banco de dados:

    ```bash
    npx prisma migrate dev --name init
    ```

    Se for a primeira vez, você pode usar `init` como nome da migração. Para migrações futuras, use um nome descritivo.

## Populando o Banco de Dados (Opcional)

O projeto possui scripts para popular o banco de dados com dados iniciais:

*   Para criar acessos:

    ```bash
    npm run db:seed:access
    ```

*   Para criar usuários (assessores):

    ```bash
    npm run db:seed:advisor
    ```

## Rodando a Aplicação

Você pode rodar a aplicação em modo de desenvolvimento ou produção.

### Modo de Desenvolvimento

Para rodar a aplicação com `tsx watch` (que recarrega automaticamente as mudanças):

```bash
npm run start
```

### Modo de Produção

1.  Construa o projeto:

    ```bash
    npm run build
    ```

2.  Inicie a aplicação em produção:

    ```bash
    npm run start:prod
    ```

    (Nota: O script `start:prod` é definido no `Dockerfile` e pode precisar ser adicionado ao `package.json` se você não estiver usando Docker para produção direta.)

## Testes

Para rodar os testes do projeto:

```bash
npm test
```

Para rodar os testes em modo `watch`:

```bash
npm run test:watch
```

Para gerar o relatório de cobertura de testes:

```bash
npm run test:coverage
```

## Estrutura do Projeto

```
.env
Dockerfile
docker-compose.yml
package.json
prisma/
  migrations/
  schema.prisma
src/
  controllers/
  middlewares/
  routes/
  seeders/
  index.ts
tsconfig.json
```

## Contribuição

Se você deseja contribuir com este projeto, sinta-se à vontade para abrir issues ou pull requests no repositório original.

