import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const top = [
  ["Bateria Gold Promoção", "282 un.", "R$ 4.230,00"],
  ["Cabo USB-C 1m", "157 un.", "R$ 7.834,30"],
  ["Carregador Turbo 20W", "85 un.", "R$ 6.791,50"]
];

const low = [
  ["Bateria iPhone 11 Homologada", "7 un.", "R$ 770,00"],
  ["Bateria iPhone 11 com Flex", "7 un.", "R$ 595,00"],
  ["Alicate de Corte Yaxum", "12 un.", "R$ 240,00"]
];

export default function ProdutosPage() {
  return (
    <>
      <PageHeader title="Produtos" description="Visão de desempenho dos itens por período." />
      <div className="two-column">
        <section className="panel">
          <div className="section-heading inline">
            <div><h2>Mais vendidos</h2><p>Exemplo de ranking por quantidade.</p></div>
            <ArrowUpRight size={20} />
          </div>
          <div className="ranking-list">
            {top.map(([name, qtd, valor], index) => (
              <div className="ranking-row" key={name}>
                <span className="rank">{index + 1}</span>
                <div><strong>{name}</strong><small>{qtd}</small></div>
                <span>{valor}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="section-heading inline">
            <div><h2>Menos vendidos</h2><p>Itens para revisar giro e compra.</p></div>
            <ArrowDownRight size={20} />
          </div>
          <div className="ranking-list">
            {low.map(([name, qtd, valor], index) => (
              <div className="ranking-row" key={name}>
                <span className="rank">{index + 1}</span>
                <div><strong>{name}</strong><small>{qtd}</small></div>
                <span>{valor}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
