"use client";

import { useCallback, useEffect, useState } from "react";
import { Boxes, ChevronLeft, ChevronRight, PackageMinus, RefreshCw, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { formatCurrency, formatNumber } from "@/lib/format";

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

type Pagination = {
  page: number;
  pageSize: number;
  filteredCount: number;
  totalPages: number;
};

type Stats = {
  totalProdutos: number;
  estoqueTotal: number;
  semEstoque: number;
};

export default function EstoquePage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [order, setOrder] = useState("total-desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [stockItems, setStockItems] = useState<EstoqueItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 100, filteredCount: 0, totalPages: 1 });
  const [stats, setStats] = useState<Stats>({ totalProdutos: 0, estoqueTotal: 0, semEstoque: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query]);

  const carregarEstoque = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/estoque", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page,
          pageSize,
          query: debouncedQuery,
          order
        }),
        cache: "no-store"
      });

      const payload = await response.json();
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.error || "Não foi possível carregar o estoque.");
      }

      setStockItems(Array.isArray(payload?.data) ? payload.data : []);
      setPagination(payload?.pagination || { page: 1, pageSize, filteredCount: 0, totalPages: 1 });
      setStats(payload?.stats || { totalProdutos: 0, estoqueTotal: 0, semEstoque: 0 });

      if (payload?.pagination?.page && payload.pagination.page !== page) {
        setPage(payload.pagination.page);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar estoque.");
      setStockItems([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, order, page, pageSize]);

  useEffect(() => {
    carregarEstoque();
  }, [carregarEstoque, refreshKey]);

  function alterarOrdenacao(value: string) {
    setOrder(value);
    setPage(1);
  }

  function alterarTamanhoPagina(value: number) {
    setPageSize(value);
    setPage(1);
  }

  const inicioExibicao = pagination.filteredCount === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const fimExibicao = Math.min(pagination.page * pagination.pageSize, pagination.filteredCount);

  return (
    <>
      <PageHeader
        title="Controle de estoque"
        description="Consulte e compare o estoque das lojas de Pádua, Macaé e Campos."
        action={
          <button className="button secondary" type="button" onClick={() => setRefreshKey((value) => value + 1)} disabled={loading}>
            <RefreshCw size={16} /> {loading ? "Atualizando..." : "Atualizar"}
          </button>
        }
      />

      <section className="stats-grid four">
        <StatCard label="Produtos" value={formatNumber(stats.totalProdutos)} helper="Dados reais do estoque" icon={Boxes} />
        <StatCard label="Estoque total" value={formatNumber(stats.estoqueTotal)} helper="Somatório das três lojas" icon={Boxes} />
        <StatCard label="Sem estoque em uma loja" value={formatNumber(stats.semEstoque)} helper="Ponto de atenção" icon={PackageMinus} />
        <StatCard label="Lojas" value="3" helper="Pádua, Macaé e Campos" icon={Boxes} />
      </section>

      <section className="panel">
        <div className="toolbar">
          <label className="search-box">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por produto, código interno ou marca..." />
          </label>

          <select value={order} onChange={(event) => alterarOrdenacao(event.target.value)} className="select-control" aria-label="Ordenação">
            <option value="total-desc">Maior estoque total</option>
            <option value="total-asc">Menor estoque total</option>
            <option value="min-asc">Menor estoque em uma loja</option>
            <option value="max-desc">Maior estoque em uma loja</option>
            <option value="nome">Nome do produto</option>
          </select>

          <select value={pageSize} onChange={(event) => alterarTamanhoPagina(Number(event.target.value))} className="select-control" aria-label="Itens por página">
            <option value={50}>50 por página</option>
            <option value={100}>100 por página</option>
            <option value={200}>200 por página</option>
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
              {stockItems.map((item) => {
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
              {!loading && !error && stockItems.length === 0 && (
                <tr><td colSpan={8}>Nenhum produto encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer" style={{ gap: 12, flexWrap: "wrap" }}>
          <span>
            {loading
              ? "Carregando estoque..."
              : `${inicioExibicao}-${fimExibicao} de ${pagination.filteredCount} produto(s)`}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              className="button secondary"
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={loading || pagination.page <= 1}
              aria-label="Página anterior"
            >
              <ChevronLeft size={16} /> Anterior
            </button>

            <span>Página {pagination.page} de {pagination.totalPages}</span>

            <button
              className="button secondary"
              type="button"
              onClick={() => setPage((value) => Math.min(pagination.totalPages, value + 1))}
              disabled={loading || pagination.page >= pagination.totalPages}
              aria-label="Próxima página"
            >
              Próxima <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
