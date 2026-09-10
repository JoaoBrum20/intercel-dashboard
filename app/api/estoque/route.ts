import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://otjwjkrbbzmrsgvhcpkj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_U1aMNi9x_BmiAc8bbvBWSw_xiMcb_OW";

export async function POST() {
  try {
    const params = new URLSearchParams({
      select: "id,sku,descricao,loja,estoque_atual,valor_venda,marca",
      order: "sku.asc"
    });

    const response = await fetch(`${SUPABASE_URL}/rest/v1/INTERCEL_ESTOQUE?${params.toString()}`, {
      method: "GET",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        Accept: "application/json"
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

    return NextResponse.json({ success: true, data: payload });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Erro inesperado." },
      { status: 500 }
    );
  }
}
