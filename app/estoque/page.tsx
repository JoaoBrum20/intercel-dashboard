"use client";

import { useMemo, useState } from "react";
import { Boxes, PackageMinus, RefreshCw, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { formatCurrency, formatNumber } from "@/lib/format";
import { stockItems } from "@/lib/mock-data";

export default function EstoquePage() {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("total-desc");

  const rows = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    const filtered = stockItems.filter((item) => {
      if (!term) return true;
      return [item.descricao, item.codigo, item.marca].some((value) => value.toLocaleLowerCase("pt-BR").includes(term));
    });

    return [...filtered].sort((a, b) => {
      const totalA = a.padua + a.itaperuna + a.campos;
      const totalB = b.padua + b.itaperuna + b.campos;
      if (order === "total-asc") return totalA - totalB;
      if (order === "nome") return a.descricao.localeCompare(b.descricao, "pt-BR");
      return totalB - totalA;
    });
  }, [query, order]);

  const total = stockItems.reduce((acc, item) => acc + item.padua + item.itaperuna + item.campos, 0);
  const semEstoque = stockItems.filter((item) => [item.padua, item.itaperuna, item.campos].some((qtd) => qtd === 0)).length;

  return (
    <>
      <PageHeader
        title="Controle de estoque"
        description="Consulte e compare o estoque das lojas de Pádua, Itaperuna e Campos."
        action={<button className="button secondary" type="button"><RefreshCw size={16} /> Atualizar</button>}
      />

      <section className="stats-grid four">
        <StatCard label="Produtos" value={formatNumber(stockItems.length)} helper="Protótipo demonstrativo" icon={Boxes} />
        <StatCard label="Estoque total" value={formatNumber(total)} helper="Somatório das três lojas" icon={Boxes} />
        <StatCard label="Sem estoque em uma loja" value={formatNumber(semEstoque)} helper="Ponto de atenção" icon={PackageMinus} />
        <StatCard label="Lojas" value="3" helper="Pádua, Itaperuna e Campos" icon={Boxes} />
      </section>

      <section className="panel">
        <div className="toolbar">
          <label className="search-box">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por produto, código interno ou marca..." />
          </label>

          <select value={order} onChange={(event) => setOrder(event.target.value)} className="select-control" aria-label="Ordenação">
            <option value="total-desc">Maior estoque total</option>
            <option value="total-asc">Menor estoque total</option>
            <option value="nome">Nome do produto</option>
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Código interno</th>
                <th>Marca</th>
                <th>Pádua</th>
                <th>Itaperuna</th>
                <th>Campos</th>
                <th>Total</th>
                <th>Valor varejo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const totalItem = item.padua + item.itaperuna + item.campos;
                return (
                  <tr key={item.id}>
                    <td className="product-cell"><strong>{item.descricao}</strong></td>
                    <td><span className="code-chip">{item.codigo}</span></td>
                    <td>{item.marca || "—"}</td>
                    <td className={item.padua === 0 ? "zero-stock" : ""}>{item.padua}</td>
                    <td className={item.itaperuna === 0 ? "zero-stock" : ""}>{item.itaperuna}</td>
                    <td className={item.campos === 0 ? "zero-stock" : ""}>{item.campos}</td>
                    <td><strong>{totalItem}</strong></td>
                    <td>{formatCurrency(item.valorVarejo)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>{rows.length} produto(s) exibido(s)</span>
          <span>Integração real será conectada via API interna → n8n → TagPlus</span>
        </div>
      </section>
    </>
  );
}
