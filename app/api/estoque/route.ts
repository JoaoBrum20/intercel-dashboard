import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://otjwjkrbbzmrsgvhcpkj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_U1aMNi9x_BmiAc8bbvBWSw_xiMcb_OW";
const PAGE_SIZES = new Set([50, 100, 200]);
const RECENT_ZERO_LIMIT = 200;

type EstoqueViewRow = {
  sku: string;
  descricao?: string | null;
  marca?: string | null;
  valor_venda?: number | string | null;
  fornecedores?: string | null;
  padua?: number | string | null;
  itaperuna?: number | string | null;
  campos?: number | string | null;
};

function separarFornecedores(valor?: string | null) {
  if (!valor) return [];

  return valor
    .split(/[,;|]/)
    .map((fornecedor) => fornecedor.trim())
    .filter(Boolean);
}

function safeIlikeValue(value: string) {
  return value.replace(/[,*()]/g, " ").trim();
}

function montarOrFornecedores(termos: string[]) {
  return termos
    .filter(Boolean)
    .map((termo) => `fornecedores.ilike.*${safeIlikeValue(termo)}*`)
    .join(",");
}

function montarOrBusca(query: string) {
  return [
    `descricao.ilike.*${query}*`,
    `sku.ilike.*${query}*`,
    `marca.ilike.*${query}*`,
    `fornecedores.ilike.*${query}*`
  ].join(",");
}

function montarOrdenacao(order: string) {
  if (order === "zero-recent") return "zerou_em.desc.nullslast,sku.asc";

  const principal = (() => {
    if (order === "total-asc") return "estoque_total.asc";
    if (order === "min-asc") return "menor_estoque.asc";
    if (order === "max-desc") return "maior_estoque.desc";
    if (order === "nome") return "descricao.asc";
    return "estoque_total.desc";
  })();

  return `movimentacao_recente.desc,${principal},sku.asc`;
}

async function supabaseGet(path: string, params: URLSearchParams, extraHeaders: Record<string, string> = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}?${params.toString()}`, {
    method: "GET",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      Accept: "application/json",
      ...extraHeaders
    },
    cache: "no-store"
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const requestedPage = Number(body?.page || 1);
    const requestedPageSize = Number(body?.pageSize || 100);
    const page = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1;
    const pageSize = PAGE_SIZES.has(requestedPageSize) ? requestedPageSize : 100;
    const query = safeIlikeValue(String(body?.query || "").trim());
    const order = String(body?.order || "total-desc");
    const zeroRecent = order === "zero-recent";
    const fornecedoresSelecionados = Array.isArray(body?.fornecedores)
      ? body.fornecedores.map((nome: unknown) => String(nome || "").trim()).filter(Boolean)
      : [];

    const sourceView = zeroRecent ? "INTERCEL_ESTOQUE_ZERADOS_RECENTES" : "INTERCEL_ESTOQUE_CONSOLIDADO";
    const pageParams = new URLSearchParams({
      select: "sku,descricao,marca,valor_venda,fornecedores,padua,itaperuna,campos",
      order: montarOrdenacao(order)
    });

    const filtroBusca = query ? montarOrBusca(query) : "";
    const filtroFornecedores = montarOrFornecedores(fornecedoresSelecionados);

    if (filtroBusca && filtroFornecedores) {
      pageParams.set("and", `(or(${filtroBusca}),or(${filtroFornecedores}))`);
    } else if (filtroBusca) {
      pageParams.set("or", `(${filtroBusca})`);
    } else if (filtroFornecedores) {
      pageParams.set("or", `(${filtroFornecedores})`);
    }

    const maxRecentPages = Math.max(1, Math.ceil(RECENT_ZERO_LIMIT / pageSize));
    const queryPage = zeroRecent ? Math.min(page, maxRecentPages) : page;
    const from = (queryPage - 1) * pageSize;
    const maxTo = zeroRecent ? RECENT_ZERO_LIMIT - 1 : Number.MAX_SAFE_INTEGER;
    const to = Math.min(from + pageSize - 1, maxTo);

    const statsParams = new URLSearchParams({ select: "total_produtos,estoque_total,sem_estoque" });
    const fornecedoresParams = new URLSearchParams({ select: "fornecedor" });

    const [pageResponse, statsResponse, fornecedoresResponse] = await Promise.all([
      supabaseGet(sourceView, pageParams, {
        Range: `${from}-${to}`,
        Prefer: "count=exact"
      }),
      supabaseGet("INTERCEL_ESTOQUE_STATS", statsParams),
      supabaseGet("INTERCEL_FORNECEDORES", fornecedoresParams)
    ]);

    const [pagePayload, statsPayload, fornecedoresPayload] = await Promise.all([
      pageResponse.json().catch(() => null),
      statsResponse.json().catch(() => null),
      fornecedoresResponse.json().catch(() => null)
    ]);

    if (!pageResponse.ok) {
      return NextResponse.json(
        { success: false, error: "Falha ao consultar o estoque no Supabase.", details: pagePayload },
        { status: pageResponse.status }
      );
    }

    const contentRange = pageResponse.headers.get("content-range") || "";
    const totalPart = contentRange.split("/")[1];
    const rawFilteredCount = totalPart && totalPart !== "*" ? Number(totalPart) : 0;
    const filteredCount = zeroRecent ? Math.min(rawFilteredCount, RECENT_ZERO_LIMIT) : rawFilteredCount;
    const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));
    const safePage = Math.min(queryPage, totalPages);

    const data = (Array.isArray(pagePayload) ? pagePayload : []).map((row: EstoqueViewRow) => ({
      id: row.sku,
      codigo: row.sku,
      descricao: row.descricao || "Produto sem descrição",
      marca: row.marca || "",
      padua: row.padua == null ? null : Number(row.padua),
      itaperuna: row.itaperuna == null ? null : Number(row.itaperuna),
      campos: row.campos == null ? null : Number(row.campos),
      valorVarejo: Number(row.valor_venda || 0),
      fornecedores: separarFornecedores(row.fornecedores)
    }));

    const statsRow = Array.isArray(statsPayload) && statsPayload[0] ? statsPayload[0] : {};
    const fornecedores = Array.isArray(fornecedoresPayload)
      ? fornecedoresPayload
          .map((item: { fornecedor?: string | null }) => item.fornecedor || "")
          .filter(Boolean)
          .sort((a: string, b: string) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }))
      : [];

    return NextResponse.json({
      success: true,
      data,
      fornecedores,
      pagination: {
        page: safePage,
        pageSize,
        filteredCount,
        totalPages
      },
      stats: {
        totalProdutos: Number(statsRow.total_produtos || 0),
        estoqueTotal: Number(statsRow.estoque_total || 0),
        semEstoque: Number(statsRow.sem_estoque || 0)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Erro inesperado." },
      { status: 500 }
    );
  }
}
