# n8n

## Organização recomendada

Começar com workflows por domínio, não por botão.

Exemplo:

- `intercel_estoque`
- `intercel_produtos`
- `intercel_clientes`
- `intercel_oauth_tagplus`

## Estoque

Payload esperado pelo workflow:

```json
{
  "action": "listar_estoque",
  "busca": "iphone"
}
```

Fluxo sugerido:

```text
Webhook
  ↓
Validar payload
  ↓
Consultar Pádua ─┐
Consultar Itaperuna ─┼─→ Merge/Code → Respond to Webhook
Consultar Campos ─┘
```

A consulta de produtos identificada durante o protótipo usa a API TagPlus e retorna, entre outros campos, descrição, código interno, `qtd_revenda` e `valor_venda_varejo`.

## Segurança

- Não comitar access tokens ou refresh tokens.
- Guardar credenciais no n8n Credentials ou variáveis seguras.
- Renovar access tokens através do refresh token.
- Evitar colocar webhook interno diretamente no código do browser.
