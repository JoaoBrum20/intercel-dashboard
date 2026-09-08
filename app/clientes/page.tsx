import { PageHeader } from "@/components/PageHeader";
import { customerSignals } from "@/lib/mock-data";

export default function ClientesPage() {
  return (
    <>
      <PageHeader title="Clientes" description="Identifique clientes com redução de frequência ou volume de compras." />
      <section className="panel">
        <div className="section-heading"><div><h2>Clientes em queda</h2><p>Dados demonstrativos para validar o formato da análise.</p></div></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Cliente</th><th>Cidade</th><th>Compras 30d</th><th>Período anterior</th><th>Variação</th><th>Última compra</th></tr>
            </thead>
            <tbody>
              {customerSignals.map((client) => (
                <tr key={client.id}>
                  <td><strong>{client.nome}</strong></td>
                  <td>{client.cidade}</td>
                  <td>{client.compras30d}</td>
                  <td>{client.comprasPeriodoAnterior}</td>
                  <td><span className="negative-chip">{client.variacao}%</span></td>
                  <td>{client.ultimaCompra}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
