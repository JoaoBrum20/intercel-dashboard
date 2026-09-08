export type StockItem = {
  id: number;
  descricao: string;
  codigo: string;
  marca: string;
  padua: number;
  itaperuna: number;
  campos: number;
  valorVarejo: number;
};

export type CustomerSignal = {
  id: number;
  nome: string;
  cidade: string;
  compras30d: number;
  comprasPeriodoAnterior: number;
  variacao: number;
  ultimaCompra: string;
};
