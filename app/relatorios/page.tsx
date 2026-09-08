import { FileSpreadsheet, PackageSearch, ShoppingBag, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const reports = [
  { title: "Estoque consolidado", desc: "Saldo das três lojas por produto e código interno.", icon: PackageSearch },
  { title: "Produtos mais vendidos", desc: "Ranking de itens por quantidade e valor no período.", icon: ShoppingBag },
  { title: "Clientes em queda", desc: "Clientes com redução de recorrência ou volume.", icon: UsersRound },
  { title: "Exportações", desc: "Base preparada para futuras exportações CSV/Excel.", icon: FileSpreadsheet }
];

export default function RelatoriosPage() {
  return (
    <>
      <PageHeader title="Relatórios" description="Central de consultas e exportações do sistema." />
      <section className="report-grid">
        {reports.map(({ title, desc, icon: Icon }) => (
          <article className="report-card" key={title}>
            <div className="stat-icon"><Icon size={20} /></div>
            <h3>{title}</h3>
            <p>{desc}</p>
            <button className="button secondary" type="button" disabled>Em breve</button>
          </article>
        ))}
      </section>
    </>
  );
}
