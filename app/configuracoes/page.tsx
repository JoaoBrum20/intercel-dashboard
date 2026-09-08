import { PageHeader } from "@/components/PageHeader";

export default function ConfiguracoesPage() {
  return (
    <>
      <PageHeader title="Configurações" description="Parâmetros e integrações serão centralizados aqui." />
      <section className="panel empty-state">
        <h2>Estrutura preparada</h2>
        <p>No MVP, tokens e webhooks ficam somente em variáveis de ambiente do servidor/Vercel.</p>
      </section>
    </>
  );
}
