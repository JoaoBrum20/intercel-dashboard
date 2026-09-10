import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://otjwjkrbbzmrsgvhcpkj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_U1aMNi9x_BmiAc8bbvBWSw_xiMcb_OW";
const PAGE_SIZE = 1000;

export async function POST() {
  try {
    const params = new URLSearchParams({
      select: "id,sku,descricao,loja,estoque_atual,valor_venda,marca",
      order: "sku.asc,id.asc"
    });

    const todos: unknown[] = [];
    let inicio = 0;

    while (true) {
      const fim = inicio + PAGE_SIZE - 1;

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

      const pagina = Array.isArray(payload) ? payload : [];
      todos.push(...pagina);

      if (pagina.length < PAGE_SIZE) break;
      inicio += PAGE_SIZE;
    }

    return NextResponse.json({ success: true, data: todos });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Erro inesperado." },
      { status: 500 }
    );
  }
}
