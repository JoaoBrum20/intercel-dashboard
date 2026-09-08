# Arquitetura

## Princípio

O navegador não deve acessar diretamente a TagPlus nem carregar tokens OAuth2. A integração fica atrás do servidor e do n8n.

```text
UI Next.js
  ↓ POST /api/estoque
Route Handler Next.js
  ↓
Webhook n8n
  ├─ TagPlus Pádua
  ├─ TagPlus Itaperuna
  └─ TagPlus Campos
  ↓
Normalização
  ↓
JSON consolidado
```

## Responsabilidades

### Next.js
- Interface e navegação.
- Validação básica de entrada.
- Proxy server-side para o n8n.
- Tratamento de loading/erro no front.

### n8n
- Orquestração das chamadas TagPlus.
- Refresh de tokens OAuth2.
- Consulta das três lojas.
- União dos produtos por código interno.
- Regras de negócio e formatação do JSON final.

### TagPlus
- Fonte oficial de produtos, estoque, vendas e clientes.

## Evolução

Um banco como Supabase pode ser adicionado depois para cache, histórico, auditoria ou análises que não façam sentido consultar em tempo real.
