"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, PackageMinus, RefreshCw, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { formatCurrency, formatNumber } from "@/lib/format";

type EstoqueRegistro = {
  id?: number | string;
  sku?: string | null;
  descricao?: string | null;
  loja?: string | null;
  estoque_atual?: number | string | null;
  valor_venda?: number | string | null;
  marca?: string | null;
};

type EstoqueItem = {
  id: string;
  codigo: string;
  descricao: string;
  marca: string;
  padua: number;
  macae: number;
  campos: number;
  valorVarejo: number;
};

function normalizarLoja(loja?: string | null) {
  return (loja || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function agruparPorSku(registros: EstoqueRegistro[]): EstoqueItem[] {
  const mapa = new Map<string, EstoqueItem>();

  for (const registro of registros) {
    const sku = String(registro.sku || "").trim();
    if (!sku) continue;

    const atual = mapa.get(sku) || {
      id: sku,
      codigo: sku,
      descricao: registro.descricao || "Produto sem descrição",
      marca: registro.marca || "",
      padua: 0,
      macae: 0,
      campos: 0,
      valorVarejo: Number(registro.valor_venda || 0)
    };

    if (!atual.descricao && registro.descricao) atual.descricao = registro.descricao;
    if (!atual.marca && registro.marca) atual.marca = registro.marca;
    if (!atual.valorVarejo && registro.valor_venda) atual.valorVarejo = Number(registro.valor_venda || 0);

    const quantidade = Number(registro.estoque_atual || 0);
    const loja = normalizarLoja(registro.loja);

    if (loja === "padua") atual.padua = quantidade;
    if (loja === "macae") atual.macae = quantidade;
    if (loja === "campos") atual.campos = quantidade;

    mapa.set(sku, atual);
  }

  return Array.from(mapa.values());
}

export default function EstoquePage() {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("total-desc");
  const [stockItems, setStockItems] = useState<EstoqueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const carregarEstoque = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/estoque", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        cache: "no-store"
      });

      const payload = await response.json();
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error || "Não foi possível carregar o estoque.");
      }

      const bruto = payload?.data;
      const registros = Array.isArray(bruto)
        ? bruto
        : Array.isArray(bruto?.data)
          ? bruto.data
          : Array.isArray(bruto?.result)
            ? bruto.result
            : [];

      setStockItems(agruparPorSku(registros));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar estoque.");
      setStockItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarEstoque();
  }, [carregarEstoque]);

  const rows = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    const filtered = stockItems.filter((item) => {
      if (!term) return true;
      return [item.descricao, item.codigo, item.marca].some((value) => value.toLocaleLowerCase("pt-BR").includes(term));
    });

    return [...filtered].sort((a, b) => {
      const totalA = a.padua + a.macae + a.campos;
      const totalB = b.padua + b.macae + b.campos;
      if (order === "total-asc") return totalA - totalB;
      if (order === "min-asc") return Math.min(a.padua, a.macae, a.campos) - Math.min(b.padua, b.macae, b.campos);
      if (order === "max-desc") return Math.max(b.padua, b.macae, b.campos) - Math.max(a.padua, a.macae, a.campos);
      if (order === "nome") return a.descricao.localeCompare(b.descricao, "pt-BR");
      return totalB - totalA;
    });
  }, [query, order, stockItems]);

  const total = stockItems.reduce((acc, item) => acc + item.padua + item.macae + item.campos, 0);
  const semEstoque = stockItems.filter((item) => [item.padua, item.macae, item.campos].some((qtd) => qtd === 0)).length;

  return (
    <>
      <PageHeader
        title="Controle de estoque"
        description="Consulte e compare o estoque das lojas de Pádua, Macaé e Campos."
        action={
          <button className="button secondary" type="button" onClick={carregarEstoque} disabled={loading}>
            <RefreshCw size={16} /> {loading ? "Atualizando..." : "Atualizar"}
          </button>
        }
      />

      <section className="stats-grid four">
        <StatCard label="Produtos" value={formatNumber(stockItems.length)} helper="Dados reais do estoque" icon={Boxes} />
        <StatCard label="Estoque total" value={formatNumber(total)} helper="Somatório das três lojas" icon={Boxes} />
        <StatCard label="Sem estoque em uma loja" value={formatNumber(semEstoque)} helper="Ponto de atenção" icon={PackageMinus} />
        <StatCard label="Lojas" value="3" helper="Pádua, Macaé e Campos" icon={Boxes} />
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
            <option value="min-asc">Menor estoque em uma loja</option>
            <option value="max-desc">Maior estoque em uma loja</option>
            <option value="nome">Nome do produto</option>
          </select>
        </div>

        {error && <div style={{ padding: "12px 16px" }}>Erro: {error}</div>}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Código interno</th>
                <th>Marca</th>
                <th>Pádua</th>
                <th>Macaé</th>
                <th>Campos</th>
                <th>Total</th>
                <th>Valor varejo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const totalItem = item.padua + item.macae + item.campos;
                return (
                  <tr key={item.id}>
                    <td className="product-cell"><strong>{item.descricao}</strong></td>
                    <td><span className="code-chip">{item.codigo}</span></td>
                    <td>{item.marca || "—"}</td>
                    <td className={item.padua === 0 ? "zero-stock" : ""}>{item.padua}</td>
                    <td className={item.macae === 0 ? "zero-stock" : ""}>{item.macae}</td>
                    <td className={item.campos === 0 ? "zero-stock" : ""}>{item.campos}</td>
                    <td><strong>{totalItem}</strong></td>
                    <td>{formatCurrency(item.valorVarejo)}</td>
                  </tr>
                );
              })}
              {!loading && !error && rows.length === 0 && (
                <tr><td colSpan={8}>Nenhum produto encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>{loading ? "Carregando estoque..." : `${rows.length} produto(s) exibido(s)`}</span>
          <span>Fonte: estoque real integrado pelo backend</span>
        </div>
      </section>
    </>
  );
}
