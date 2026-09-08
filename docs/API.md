# Contrato de API interno

## POST /api/estoque

Rota do Next.js que encaminha a consulta ao n8n.

### Request

```json
{
  "busca": "iphone",
  "ordenacao": "total_desc"
}
```

### Resposta desejada do n8n

```json
{
  "success": true,
  "items": [
    {
      "descricao": "Bateria iPhone 11 Foxconn",
      "codigo": "166562",
      "marca": "Foxconn",
      "padua": 6,
      "itaperuna": 14,
      "campos": 3,
      "total": 23,
      "valorVarejo": 75
    }
  ]
}
```

## Regra de consolidação

A chave preferencial para unir o mesmo produto entre as três lojas é o **código interno**. Caso a base real revele divergências entre lojas, criar uma tabela de correspondência posteriormente.
