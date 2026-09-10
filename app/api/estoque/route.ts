import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://otjwjkrbbzmrsgvhcpkj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_U1aMNi9x_BmiAc8bbvBWSw_xiMcb_OW";
const SUPABASE_PAGE_SIZE = 1000;
const PAGE_SIZES = new Set([50, 100, 200]);
const DIAS_MOVIMENTACAO_RECENTE = 90;

type EstoqueRegistro = {
  id?: number | string;
  sku?: string | null;
  descricao?: string | null;
  loja?: string | null;
  estoque_atual?: number | string | null;
  valor_venda?: number | string | null;
  marca?: string | null;
  ultima_alteracao?: string | null;
  fornecedores?: string | null;
};

type EstoqueItem = {
  id: string;
  codigo: string;
  descricao: string;
  marca: string;
  padua: number | null;
  itaperuna: number | null;
  campos: number | null;
  valorVarejo: number;
  ultimaAlteracao: string | null;
  fornecedores: string[];
};

function normalizarTexto(valor?: string | null) {
  return (valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function normalizarLoja(loja?: string | null) {
  return normalizarTexto(loja);
}

function separarFornecedores(valor?: string | null) {
  if (!valor) return [];

  return valor
    .split(/[,;|]/)
    .map((fornecedor) => fornecedor.trim())
    .filter(Boolean);
}

function adicionarFornecedores(atual: string[], novos?: string | null) {
  const mapa = new Map(atual.map((fornecedor) => [normalizarTexto(fornecedor), fornecedor]));

  for (const fornecedor of separarFornecedores(novos)) {
    const chave = normalizarTexto(fornecedor);
    if (chave && !mapa.has(chave)) mapa.set(chave, fornecedor);
  }

  return Array.from(mapa.values()).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function timestampData(valor?: string | null) {
  if (!valor) return null;

  const normalizada = valor.includes("T") ? valor : valor.replace(" ", "T");
  const timestamp = Date.parse(normalizada);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function dataMaisRecente(atual: string | null, nova?: string | null) {
  if (!nova) return atual;
  if (!atual) return nova;

  const atualTs = timestampData(atual);
  const novaTs = timestampData(nova);

  if (novaTs === null) return atual;
  if (atualTs === null) return nova;
  return novaTs > atualTs ? nova : atual;
}

function teveMovimentacaoRecente(item: EstoqueItem) {
  const timestamp = timestampData(item.ultimaAlteracao);
  if (timestamp === null) return false;

  const limite = Date.now() - DIAS_MOVIMENTACAO_RECENTE * 24 * 60 * 60 * 1000;
  return timestamp >= limite;
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
      padua: null,
      itaperuna: null,
      campos: null,
      valorVarejo: Number(registro.valor_venda || 0),
      ultimaAlteracao: null,
      fornecedores: []
    };

    if (!atual.descricao && registro.descricao) atual.descricao = registro.descricao;
    if (!atual.marca && registro.marca) atual.marca = registro.marca;
    if (!atual.valorVarejo && registro.valor_venda) atual.valorVarejo = Number(registro.valor_venda || 0);
    atual.ultimaAlteracao = dataMaisRecente(atual.ultimaAlteracao, registro.ultima_alteracao);
    atual.fornecedores = adicionarFornecedores(atual.fornecedores, registro.fornecedores);

    const quantidade = Number(registro.estoque_atual || 0);
    const loja = normalizarLoja(registro.loja);

    if (loja === "padua") atual.padua = quantidade;
    if (loja === "itaperuna") atual.itaperuna = quantidade;
    if (loja === "campos") atual.campos = quantidade;

    mapa.set(sku, atual);
  }

  return Array.from(mapa.values());
}

function valoresCadastrados(item: EstoqueItem) {
  return [item.padua, item.itaperuna, item.campos].filter((valor): valor is number => valor !== null);
}

function totalItem(item: EstoqueItem) {
  return (item.padua ?? 0) + (item.itaperuna ?? 0) + (item.campos ?? 0);
}

function compararOrdenacao(a: EstoqueItem, b: EstoqueItem, order: string) {
  const totalA = totalItem(a);
  const totalB = totalItem(b);
  const cadastradosA = valoresCadastrados(a);
  const cadastradosB = valoresCadastrados(b);

  if (order === "total-asc") return totalA - totalB;
  if (order === "min-asc") {
    const menorA = cadastradosA.length ? Math.min(...cadastradosA) : Number.POSITIVE_INFINITY;
    const menorB = cadastradosB.length ? Math.min(...cadastradosB) : Number.POSITIVE_INFINITY;
    return menorA - menorB;
  }
  if (order === "max-desc") {
    const maiorA = cadastradosA.length ? Math.max(...cadastradosA) : Number.NEGATIVE_INFINITY;
    const maiorB = cadastradosB.length ? Math.max(...cadastradosB) : Number.NEGATIVE_INFINITY;
    return maiorB - maiorA;
  }
  if (order === "nome") return a.descricao.localeCompare(b.descricao, "pt-BR");
  return totalB - totalA;
}

function ordenarItens(itens: EstoqueItem[], order: string) {
  return [...itens].sort((a, b) => {
    const recenteA = teveMovimentacaoRecente(a);
    const recenteB = teveMovimentacaoRecente(b);

    if (recenteA !== recenteB) return recenteA ? -1 : 1;

    return compararOrdenacao(a, b, order);
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const requestedPage = Number(body?.page || 1);
    const requestedPageSize = Number(body?.pageSize || 100);
    const page = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1;
    const pageSize = PAGE_SIZES.has(requestedPageSize) ? requestedPageSize : 100;
    const query = String(body?.query || "").trim().toLocaleLowerCase("pt-BR");
    const order = String(body?.order || "total-desc");
    const fornecedoresSelecionados = Array.isArray(body?.fornecedores)
      ? body.fornecedores.map((nome: unknown) => normalizarTexto(String(nome || ""))).filter(Boolean)
      : [];

    const params = new URLSearchParams({
      select: "id,sku,descricao,loja,estoque_atual,valor_venda,marca,ultima_alteracao,fornecedores",
      order: "sku.asc,id.asc"
    });

    const todos: EstoqueRegistro[] = [];
    let inicio = 0;

    while (true) {
      const fim = inicio + SUPABASE_PAGE_SIZE - 1;

      const response = await fetch(`${SUPABASE_URL}/rest/v1/INTERCEL_ESTOQUE?${params.toString()}`, {
        method: "GET",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          Accept: "application/json",
          Range: `${inicio}-${fim}`
        },
        cache: "no-store"
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        return NextResponse.json(
          { success: false, error: "Falha ao consultar o estoque no Supabase.", details: payload },
          { status: response.status }
        );
      }

      const pagina = Array.isArray(payload) ? (payload as EstoqueRegistro[]) : [];
      todos.push(...pagina);

      if (pagina.length < SUPABASE_PAGE_SIZE) break;
      inicio += SUPABASE_PAGE_SIZE;
    }

    let itens = agruparPorSku(todos);

    const fornecedores = Array.from(
      new Map(
        itens
          .flatMap((item) => item.fornecedores)
          .map((nome) => [normalizarTexto(nome), nome])
      ).values()
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));

    const totalProdutos = itens.length;
    const estoqueTotal = itens.reduce((acc, item) => acc + totalItem(item), 0);
    const semEstoque = itens.filter((item) => valoresCadastrados(item).some((qtd) => qtd === 0)).length;

    if (query) {
      itens = itens.filter((item) =>
        [item.descricao, item.codigo, item.marca, ...item.fornecedores].some((value) =>
          value.toLocaleLowerCase("pt-BR").includes(query)
        )
      );
    }

    if (fornecedoresSelecionados.length) {
      itens = itens.filter((item) => {
        const fornecedoresItem = item.fornecedores.map((nome) => normalizarTexto(nome));
        return fornecedoresSelecionados.some((selecionado: string) => fornecedoresItem.includes(selecionado));
      });
    }

    itens = ordenarItens(itens, order);

    const filteredCount = itens.length;
    const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));
    const safePage = Math.min(page, totalPages);
    const from = (safePage - 1) * pageSize;
    const data = itens.slice(from, from + pageSize);

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
        totalProdutos,
        estoqueTotal,
        semEstoque
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Erro inesperado." },
      { status: 500 }
    );
  }
}
