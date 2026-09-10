# Dashboard de Estoque Multi-Loja

Sistema web para centralizar informações de **estoque, produtos e clientes** de uma operação com múltiplas unidades.

O projeto foi estruturado para começar simples, ser apresentável e evoluir sem precisar reescrever a base.

## Status atual

A página de estoque já está conectada aos dados reais do banco e não usa mais dados demonstrativos.

Hoje o fluxo principal é:

```text
Navegador
   ↓
Next.js / Vercel
   ↓
API interna do Next.js
   ↓
Supabase
```

Os registros são armazenados por **SKU + unidade**, permitindo que o mesmo produto tenha estoques diferentes em cada loja.

Exemplo conceitual:

```text
SKU-001 | Loja A | 5
SKU-001 | Loja B | 12
SKU-001 | Loja C | 3
```

No front-end esses registros são agrupados por SKU e exibidos em uma única linha.

## Funcionalidades atuais

- Consulta de estoque real.
- Consolidação de estoque entre três unidades.
- Busca por descrição, código interno ou marca.
- Agrupamento dos registros pelo SKU.
- Exibição do estoque individual por unidade.
- Cálculo automático do estoque total.
- Destaque para produtos sem estoque em alguma unidade.
- Ordenação por:
  - maior estoque total;
  - menor estoque total;
  - menor estoque em uma unidade;
  - maior estoque em uma unidade;
  - nome do produto.
- Paginação interna da consulta ao banco para buscar mais de 1.000 registros.
- Botão de atualização dos dados.

## Regra de menor estoque

A ordenação de menor estoque não considera apenas o total.

Para cada produto é calculado o menor valor entre as unidades:

```ts
Math.min(lojaA, lojaB, lojaC)
```

Assim, um produto com estoque `0 / 50 / 1000` aparece antes de um produto com `5 / 5 / 5`, porque existe uma unidade zerada.

## Stack

- Next.js 15
- React 19
- TypeScript
- CSS
- lucide-react
- Supabase / PostgreSQL
- Vercel
- GitHub
- n8n para integrações e sincronizações externas

## Estrutura

```text
app/
  api/estoque/        # consulta server-side do estoque
  estoque/            # consulta consolidada de estoque
  produtos/           # mais/menos vendidos
  clientes/           # análises de clientes
  relatorios/         # relatórios futuros
  configuracoes/      # configurações futuras
components/           # componentes reutilizáveis
lib/                  # tipos e utilitários
docs/                 # documentação técnica
```

## Banco de dados

O estoque utiliza uma estrutura baseada em uma linha por **produto + unidade**.

Campos principais utilizados pelo dashboard:

```text
sku
descricao
loja
estoque_atual
valor_venda
marca
```

Outros campos de produto e estoque permanecem disponíveis no banco para futuras funcionalidades.

## Segurança

- O front-end utiliza apenas uma chave publicável.
- Nenhuma chave administrativa deve ser exposta no navegador.
- A tabela de estoque possui RLS habilitado.
- O acesso público utilizado pelo dashboard é somente de leitura.
- Segredos, tokens e URLs internas devem permanecer em variáveis de ambiente server-side.
- Nomes de clientes, unidades, cidades e outros dados identificáveis não devem ser incluídos na documentação pública.

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse:

```text
http://localhost:3000
```

## Próximas etapas

1. Refinar filtros e ordenações da tela de estoque.
2. Melhorar paginação e desempenho da tabela no front-end.
3. Adicionar filtros por categoria, marca e unidade.
4. Implementar páginas de produtos mais e menos vendidos.
5. Implementar análise de clientes.
6. Adicionar autenticação de usuário.
7. Evoluir as rotinas de sincronização com as fontes externas.
