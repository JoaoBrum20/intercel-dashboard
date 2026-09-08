# Intercel Dashboard

Protótipo de um sistema web para centralizar informações de **estoque, produtos e clientes** das lojas da Intercel em **Pádua, Itaperuna e Campos**.

O projeto foi estruturado para começar simples, ser apresentável ao cliente e evoluir sem precisar reescrever a base.

## Objetivo do MVP

- Exibir uma visão geral do sistema.
- Consultar estoque consolidado das três lojas.
- Buscar produto por descrição, código interno ou marca.
- Ordenar produtos por maior ou menor estoque total.
- Preparar páginas para mais vendidos, menos vendidos e clientes com queda de compras.
- Manter credenciais e webhooks fora do navegador.

> No protótipo, os dados de interface são demonstrativos. A integração real será conectada à API TagPlus via n8n.

## Arquitetura

```text
Navegador
   ↓
Next.js / Vercel
   ↓
API interna do Next.js
   ↓
n8n
   ↓
TagPlus - Pádua / Itaperuna / Campos
```

A URL real do webhook n8n fica em variável de ambiente **server-side**, evitando expor a infraestrutura diretamente no front-end.

## Stack

- Next.js 15
- React 19
- TypeScript
- CSS puro
- lucide-react
- n8n para orquestração
- TagPlus como fonte de dados
- Vercel para deploy
- GitHub para versionamento

## Estrutura

```text
app/
  api/estoque/        # proxy server-side para o n8n
  estoque/            # consulta consolidada de estoque
  produtos/           # mais/menos vendidos
  clientes/           # clientes com queda de compras
  relatorios/         # relatórios futuros
  configuracoes/      # configurações futuras
components/           # componentes reutilizáveis
lib/                  # tipos, dados mock e utilitários
docs/                 # documentação técnica
```

## Rodando localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Acesse `http://localhost:3000`.

## Variáveis de ambiente

```env
N8N_ESTOQUE_WEBHOOK_URL=https://seu-n8n.com/webhook/estoque
```

Não use `NEXT_PUBLIC_` para tokens, segredos ou URLs internas que você não quer expor no navegador.

## Deploy na Vercel

1. Suba o repositório no GitHub.
2. Importe o repositório na Vercel.
3. Cadastre `N8N_ESTOQUE_WEBHOOK_URL` em **Project Settings → Environment Variables**.
4. Faça o deploy.

## Integração de estoque

A rota `POST /api/estoque` recebe o payload do front, adiciona a ação `listar_estoque` e encaminha ao webhook configurado no n8n.

Exemplo de payload:

```json
{
  "busca": "iphone 11",
  "ordenacao": "total_desc"
}
```

O n8n será responsável por consultar as três contas/lojas, normalizar os dados e devolver um único JSON para o Next.js.

## Próximas etapas

1. Validar layout e funcionalidades com o cliente.
2. Conectar a página de estoque ao webhook real.
3. Normalizar produtos entre as três lojas por código interno.
4. Implementar mais/menos vendidos usando endpoints da TagPlus.
5. Implementar análise de clientes.
6. Adicionar autenticação do usuário.
7. Adicionar cache/histórico em banco somente quando houver necessidade real.

Veja também `docs/ARQUITETURA.md`, `docs/N8N.md` e `docs/API.md`.
