import Link from "next/link";
import { ArrowRight, Boxes, ShoppingBag, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { formatNumber } from "@/lib/format";
import { stockItems } from "@/lib/mock-data";

export default function HomePage() {
  const totalEstoque = stockItems.reduce((acc, item) => acc + item.padua + item.itaperuna + item.campos, 0);
  const semEstoqueEmAlgumaLoja = stockItems.filter((item) => [item.padua, item.itaperuna, item.campos].some((qtd) => qtd === 0)).length;

  return (
    <>
      <PageHeader title="Visão geral" description="Acesso rápido às informações das três lojas." />

      <section className="stats-grid">
        <StatCard label="Produtos no protótipo" value={formatNumber(stockItems.length)} helper="Dados demonstrativos" icon={ShoppingBag} />
        <StatCard label="Estoque consolidado" value={formatNumber(totalEstoque)} helper="Pádua + Itaperuna + Campos" icon={Boxes} />
        <StatCard label="Atenção de estoque" value={formatNumber(semEstoqueEmAlgumaLoja)} helper="Sem saldo em pelo menos uma loja" icon={UsersRound} />
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Acessos principais</h2>
            <p>Escolha uma área para consultar.</p>
          </div>
        </div>

        <div className="shortcut-grid">
          <Link href="/estoque" className="shortcut-card">
            <div>
              <span className="eyebrow">01</span>
              <h3>Controle de estoque</h3>
              <p>Compare rapidamente o saldo de Pádua, Itaperuna e Campos.</p>
            </div>
            <ArrowRight size={20} />
          </Link>

          <Link href="/produtos" className="shortcut-card">
            <div>
              <span className="eyebrow">02</span>
              <h3>Desempenho de produtos</h3>
              <p>Visualize os itens mais vendidos e os que precisam de atenção.</p>
            </div>
            <ArrowRight size={20} />
          </Link>

          <Link href="/clientes" className="shortcut-card">
            <div>
              <span className="eyebrow">03</span>
              <h3>Clientes</h3>
              <p>Encontre clientes que reduziram frequência ou volume de compras.</p>
            </div>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </>
  );
}
