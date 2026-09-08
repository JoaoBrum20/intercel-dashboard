import type { CustomerSignal, StockItem } from "./types";

export const stockItems: StockItem[] = [
  { id: 1, descricao: "Bateria iPhone 11 Foxconn", codigo: "166562", marca: "Foxconn", padua: 6, itaperuna: 14, campos: 3, valorVarejo: 75 },
  { id: 2, descricao: "Bateria Gold Promoção", codigo: "BATPROMO", marca: "Gold", padua: 106, itaperuna: 82, campos: 94, valorVarejo: 15 },
  { id: 3, descricao: "Álcool Isopropílico 1 Litro", codigo: "AL01", marca: "", padua: 11, itaperuna: 8, campos: 15, valorVarejo: 45 },
  { id: 4, descricao: "Álcool Isopropílico 110 ml", codigo: "AL110", marca: "", padua: 29, itaperuna: 18, campos: 31, valorVarejo: 20 },
  { id: 5, descricao: "Álcool Isopropílico 250 ml", codigo: "AL250", marca: "", padua: 12, itaperuna: 9, campos: 7, valorVarejo: 25 },
  { id: 6, descricao: "Álcool Isopropílico 500 ml", codigo: "AL500", marca: "", padua: 19, itaperuna: 21, campos: 14, valorVarejo: 30 },
  { id: 7, descricao: "Alicate de Corte Yaxum", codigo: "2071230491201", marca: "Yaxum", padua: 4, itaperuna: 2, campos: 6, valorVarejo: 20 },
  { id: 8, descricao: "Bateria iPhone 11 com Flex VEZR", codigo: "234435", marca: "VEZR", padua: 0, itaperuna: 5, campos: 2, valorVarejo: 85 },
  { id: 9, descricao: "Bateria iPhone 11 Homologada Anatel", codigo: "HRG-H111", marca: "Wefix", padua: 2, itaperuna: 4, campos: 1, valorVarejo: 110 },
  { id: 10, descricao: "Cabo USB-C 1m", codigo: "CAB-USBC", marca: "", padua: 50, itaperuna: 45, campos: 62, valorVarejo: 49.9 },
  { id: 11, descricao: "Carregador Turbo 20W", codigo: "CAR-20W", marca: "", padua: 25, itaperuna: 32, campos: 28, valorVarejo: 79.9 },
  { id: 12, descricao: "Película 3D iPhone 13", codigo: "PEL-IP13", marca: "", padua: 0, itaperuna: 12, campos: 8, valorVarejo: 29.9 }
];

export const customerSignals: CustomerSignal[] = [
  { id: 1, nome: "Cliente A", cidade: "Pádua", compras30d: 8, comprasPeriodoAnterior: 22, variacao: -64, ultimaCompra: "06/09/2026" },
  { id: 2, nome: "Cliente B", cidade: "Itaperuna", compras30d: 11, comprasPeriodoAnterior: 19, variacao: -42, ultimaCompra: "07/09/2026" },
  { id: 3, nome: "Cliente C", cidade: "Campos", compras30d: 4, comprasPeriodoAnterior: 13, variacao: -69, ultimaCompra: "03/09/2026" },
  { id: 4, nome: "Cliente D", cidade: "Campos", compras30d: 15, comprasPeriodoAnterior: 21, variacao: -29, ultimaCompra: "08/09/2026" }
];
