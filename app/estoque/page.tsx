"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Boxes, ChevronDown, ChevronLeft, ChevronRight, LoaderCircle, PackageMinus, RefreshCw, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { formatCurrency, formatNumber } from "@/lib/format";

type EstoqueItem = {
  id: string;
  codigo: string;
  descricao: string;
  marca: string;
  padua?: number | null;
  itaperuna?: number | null;
  campos?: number | null;
  valorVarejo: number;
  fornecedores?: string[];
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

type PageEntry = number | "ellipsis-back" | "ellipsis-forward";

function exibirEstoque(valor?: number | null) {
  return valor == null ? "N/A" : valor;
}

function gerarPaginasVisiveis(atual: number, total: number): PageEntry[] {
  if (total <= 9) return Array.from({ length: total }, (_, i) => i + 1);
  if (atual <= 5) return [1, 2, 3, 4, 5, 6, "ellipsis-forward", total];
  if (atual >= total - 4) return [1, "ellipsis-back", total - 5, total - 4, total - 3, total - 2, total - 1, total];
  return [1, "ellipsis-back", atual - 2, atual - 1, atual, atual + 1, atual + 2, "ellipsis-forward", total];
}

export default function EstoquePage() {
  const supplierFilterRef = useRef<HTMLDetailsElement>(null);
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("total-desc");
  const [fornecedoresSelecionados, setFornecedoresSelecionados] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(100);
  const [appliedQuery, setAppliedQuery] = useState("");
  const [appliedOrder, setAppliedOrder] = useState("total-desc");
  const [appliedFornecedores, setAppliedFornecedores] = useState<string[]>([]);
  const [appliedPageSize, setAppliedPageSize] = useState(100);
  const [fornecedores, setFornecedores] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [stockItems, setStockItems] = useState<EstoqueItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 100, filteredCount: 0, totalPages: 1 });
  const [stats, setStats] = useState<Stats>({ totalProdutos: 0, estoqueTotal: 0, semEstoque: 0 });
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const carregarEstoque = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/estoque", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, pageSize: appliedPageSize, query: appliedQuery, order: appliedOrder, fornecedores: appliedFornecedores }),
        cache: "no-store"
      });
      const payload = await response.json();
      if (!response.ok || payload?.success === false) throw new Error(payload?.error || "Não foi possível carregar o estoque.");
      setStockItems(Array.isArray(payload?.data) ? payload.data : []);
      setFornecedores(Array.isArray(payload?.fornecedores) ? payload.fornecedores : []);
      setPagination(payload?.pagination || { page: 1, pageSize: appliedPageSize, filteredCount: 0, totalPages: 1 });
      setStats(payload?.stats || { totalProdutos: 0, estoqueTotal: 0, semEstoque: 0 });
      if (payload?.pagination?.page && payload.pagination.page !== page) setPage(payload.pagination.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar estoque.");
      setStockItems([]);
    } finally {
      setLoading(false);
      setApplying(false);
    }
  }, [appliedFornecedores, appliedOrder, appliedPageSize, appliedQuery, page]);

  useEffect(() => { carregarEstoque(); }, [carregarEstoque, refreshKey]);

  useEffect(() => {
    function fecharAoClicarFora(event: PointerEvent) {
      const details = supplierFilterRef.current;
      if (details?.open && event.target instanceof Node && !details.contains(event.target)) details.open = false;
    }
    function fecharComEscape(event: KeyboardEvent) {
      const details = supplierFilterRef.current;
      if (event.key === "Escape" && details?.open) {
        details.open = false;
        details.querySelector<HTMLElement>("summary")?.focus();
      }
    }
    document.addEventListener("pointerdown", fecharAoClicarFora);
    document.addEventListener("keydown", fecharComEscape);
    return () => {
      document.removeEventListener("pointerdown", fecharAoClicarFora);
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, []);

  const filtrosAlterados = useMemo(() => {
    const atual = [...fornecedoresSelecionados].sort().join("|");
    const aplicado = [...appliedFornecedores].sort().join("|");
    return query !== appliedQuery || order !== appliedOrder || pageSize !== appliedPageSize || atual !== aplicado;
  }, [appliedFornecedores, appliedOrder, appliedPageSize, appliedQuery, fornecedoresSelecionados, order, pageSize, query]);

  const paginasVisiveis = useMemo(() => gerarPaginasVisiveis(pagination.page, pagination.totalPages), [pagination.page, pagination.totalPages]);

  function alternarFornecedor(nome: string) {
    setFornecedoresSelecionados((atuais) => atuais.includes(nome) ? atuais.filter((item) => item !== nome) : [...atuais, nome]);
  }

  function aplicarFiltros() {
    if (loading || !filtrosAlterados) return;
    setApplying(true);
    supplierFilterRef.current?.removeAttribute("open");
    setAppliedQuery(query.trim());
    setAppliedOrder(order);
    setAppliedFornecedores(fornecedoresSelecionados);
    setAppliedPageSize(pageSize);
    setPage(1);
  }

  function irParaPagina(numero: number) {
    if (loading || numero === pagination.page || numero < 1 || numero > pagination.totalPages) return;
    setPage(numero);
  }

  function pularPaginas(direcao: "back" | "forward") {
    const salto = 5;
    const destino = direcao === "back"
      ? Math.max(1, pagination.page - salto)
      : Math.min(pagination.totalPages, pagination.page + salto);
    irParaPagina(destino);
  }

  const resumoFornecedores = fornecedoresSelecionados.length === 0
    ? "Todos os fornecedores"
    : fornecedoresSelecionados.length === 1
      ? fornecedoresSelecionados[0]
      : `${fornecedoresSelecionados.length} fornecedores`;

  const inicioExibicao = pagination.filteredCount === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const fimExibicao = Math.min(pagination.page * pagination.pageSize, pagination.filteredCount);

  return (
    <>
      <PageHeader
        title="Controle de estoque"
        description="Consulte e compare o estoque das lojas de Pádua, Itaperuna e Campos."
        action={
          <button className="button secondary" type="button" onClick={() => setRefreshKey((value) => value + 1)} disabled={loading}>
            <RefreshCw size={16} className={loading && !applying ? "spin" : ""} /> {loading && !applying ? "Atualizando..." : "Atualizar"}
          </button>
        }
      />

      <section className="stats-grid four">
        <StatCard label="Produtos" value={formatNumber(stats.totalProdutos)} helper="Dados reais do estoque" icon={Boxes} />
        <StatCard label="Estoque total" value={formatNumber(stats.estoqueTotal)} helper="Somatório das três lojas" icon={Boxes} />
        <StatCard label="Sem estoque em uma loja" value={formatNumber(stats.semEstoque)} helper="Ponto de atenção" icon={PackageMinus} />
        <StatCard label="Lojas" value="3" helper="Pádua, Itaperuna e Campos" icon={Boxes} />
      </section>

      <section className="panel" aria-busy={loading}>
        <div className="toolbar estoque-toolbar">
          <label className="search-box">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && filtrosAlterados && !loading) aplicarFiltros(); }} placeholder="Buscar por produto, código interno, marca ou fornecedor..." />
          </label>

          <details ref={supplierFilterRef} className="supplier-filter">
            <summary aria-label="Filtrar por fornecedores"><span>{resumoFornecedores}</span><ChevronDown size={16} /></summary>
            <div className="supplier-menu">
              <button type="button" className="supplier-clear" onClick={() => setFornecedoresSelecionados([])}>Limpar seleção</button>
              <div className="supplier-options">
                {fornecedores.map((nome) => (
                  <label key={nome} className="supplier-option">
                    <input type="checkbox" checked={fornecedoresSelecionados.includes(nome)} onChange={() => alternarFornecedor(nome)} />
                    <span>{nome}</span>
                  </label>
                ))}
              </div>
            </div>
          </details>

          <select value={order} onChange={(event) => setOrder(event.target.value)} className="select-control" aria-label="Ordenar estoque">
            <option value="total-desc">Maior estoque total</option>
            <option value="total-asc">Menor estoque total</option>
            <option value="min-asc">Menor estoque em uma loja</option>
            <option value="max-desc">Maior estoque em uma loja</option>
            <option value="zero-recent">Zerados recentemente</option>
            <option value="nome">Nome do produto</option>
          </select>

          <button className="button apply-button" type="button" onClick={aplicarFiltros} disabled={loading || !filtrosAlterados} aria-busy={applying}>
            {applying ? <><LoaderCircle size={16} className="spin" /> Carregando</> : "Ir"}
          </button>
        </div>

        {error && <div style={{ padding: "12px 16px" }}>Erro: {error}</div>}

        <div className="table-wrap">
          <table>
            <thead><tr><th>Produto</th><th>Código interno</th><th>Marca</th><th className="stock-column">Pádua</th><th className="stock-column">Itaperuna</th><th className="stock-column">Campos</th><th className="stock-column">Total</th><th>Valor varejo</th></tr></thead>
            <tbody>
              {stockItems.map((item) => {
                const totalItem = (item.padua ?? 0) + (item.itaperuna ?? 0) + (item.campos ?? 0);
                return (
                  <tr key={item.id}>
                    <td className="product-cell"><strong>{item.descricao}</strong></td>
                    <td><span className="code-chip">{item.codigo}</span></td>
                    <td>{item.marca || "—"}</td>
                    <td className={`stock-column ${item.padua === 0 ? "zero-stock" : ""}`}>{exibirEstoque(item.padua)}</td>
                    <td className={`stock-column ${item.itaperuna === 0 ? "zero-stock" : ""}`}>{exibirEstoque(item.itaperuna)}</td>
                    <td className={`stock-column ${item.campos === 0 ? "zero-stock" : ""}`}>{exibirEstoque(item.campos)}</td>
                    <td className="stock-column"><strong>{totalItem}</strong></td>
                    <td>{formatCurrency(item.valorVarejo)}</td>
                  </tr>
                );
              })}
              {!loading && !error && stockItems.length === 0 && <tr><td colSpan={8}>Nenhum produto encontrado.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="table-footer estoque-footer">
          <div className="estoque-footer-left">
            <span>{loading ? "Carregando estoque..." : `${inicioExibicao}-${fimExibicao} de ${pagination.filteredCount} produto(s)`}</span>
            <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="select-control page-size-control" aria-label="Itens por página">
              <option value={50}>50 por página</option><option value={100}>100 por página</option><option value={200}>200 por página</option>
            </select>
          </div>

          <nav className="estoque-pagination" aria-label="Paginação do estoque">
            <button className="button secondary" type="button" onClick={() => irParaPagina(pagination.page - 1)} disabled={loading || pagination.page <= 1} aria-label="Página anterior"><ChevronLeft size={16} /> Anterior</button>
            <div className="page-numbers">
              {paginasVisiveis.map((item, index) => {
                if (item === "ellipsis-back") {
                  return <button key={`ellipsis-back-${index}`} type="button" className="page-ellipsis" onClick={() => pularPaginas("back")} disabled={loading} aria-label="Voltar 5 páginas" title="Voltar 5 páginas">…</button>;
                }
                if (item === "ellipsis-forward") {
                  return <button key={`ellipsis-forward-${index}`} type="button" className="page-ellipsis" onClick={() => pularPaginas("forward")} disabled={loading} aria-label="Avançar 5 páginas" title="Avançar 5 páginas">…</button>;
                }
                return (
                  <button key={item} type="button" className={`page-number ${item === pagination.page ? "active" : ""}`} onClick={() => irParaPagina(item)} disabled={loading} aria-label={`Ir para página ${item}`} aria-current={item === pagination.page ? "page" : undefined}>{item}</button>
                );
              })}
            </div>
            <button className="button secondary" type="button" onClick={() => irParaPagina(pagination.page + 1)} disabled={loading || pagination.page >= pagination.totalPages} aria-label="Próxima página">Próxima <ChevronRight size={16} /></button>
          </nav>
        </div>
      </section>
    </>
  );
}
