import { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const estadosNomes = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia',
  CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
  MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais',
  PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul',
  RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo',
  SE: 'Sergipe', TO: 'Tocantins'
};

export default function ListaContratos({ onVoltar, onEditar, onVer }) {
  const [contratos, setContratos] = useState([]);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    carregarContratos();
  }, []);

  const carregarContratos = async () => {
    try {
      const contratosRef = collection(db, 'contratos');
      const snapshot = await getDocs(contratosRef);
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setContratos(lista);
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
    }
  };

  const excluirContrato = async (id) => {
    const confirmar = window.confirm('Deseja excluir este contrato?');
    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, 'contratos', id));
      alert('Contrato excluído com sucesso.');
      carregarContratos();
    } catch (error) {
      console.error('Erro ao excluir contrato:', error);
    }
  };

  const exportarParaExcel = () => {
    const dadosExportar = contratos.map((c) => ({
      Cliente: c.cliente,
      Estado: estadosNomes[c.estado] || c.estado,
      'Valor Global (R$)': parseFloat(c.valorGlobal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      'Comissão (R$)': parseFloat(c.valorComissao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      'Objeto do Contrato': c.objeto,
      'Elevadores': c.qtdElevadores,
      'Plataformas': c.qtdPlataformas,
      'Início': c.inicio,
      'Encerramento': c.encerramento,
      'Necessita ART': c.necessitaArt ? 'Sim' : 'Não',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dadosExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contratos');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const arquivo = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(arquivo, 'contratos.xlsx');
  };

  const exportarParaPDF = () => {
    const doc = new jsPDF();
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(31, 41, 55); // bg cinza escuro
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Relatório de Contratos', 14, 14);

    const dadosTabela = contratos.map((c) => [
      c.cliente,
      estadosNomes[c.estado] || c.estado,
      parseFloat(c.valorGlobal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      parseFloat(c.valorComissao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      c.inicio,
      c.encerramento,
      c.necessitaArt ? 'Sim' : 'Não',
    ]);

    autoTable(doc, {
      headStyles: { fillColor: [75, 85, 99], textColor: 255 },
      bodyStyles: { fillColor: [55, 65, 81], textColor: 255 },
      head: [['Cliente', 'Estado', 'Valor Global', 'Comissão', 'Início', 'Encerramento', 'ART']],
      body: dadosTabela,
      startY: 20,
      styles: { fontSize: 9 },
    });

    doc.save('contratos.pdf');
  };

  const contratosFiltrados = contratos.filter((c) =>
    (c.cliente + c.estado).toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 p-4 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Contratos Cadastrados</h1>

        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <input
            type="text"
            placeholder="Buscar por cliente ou estado..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full md:w-1/2 p-2 rounded-xl bg-gray-700 border border-gray-600 text-white"
          />
          <div className="flex gap-2">
            <button
              onClick={exportarParaExcel}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl"
            >
              Exportar Excel
            </button>
            <button
              onClick={exportarParaPDF}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-xl"
            >
              Exportar PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-gray-800 shadow rounded-lg">
          <table className="min-w-full border text-sm text-white">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-3 py-2 border">Cliente</th>
                <th className="px-3 py-2 border">Estado</th>
                <th className="px-3 py-2 border">Valor Global</th>
                <th className="px-3 py-2 border">Comissão</th>
                <th className="px-3 py-2 border">Início</th>
                <th className="px-3 py-2 border">Encerramento</th>
                <th className="px-3 py-2 border">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contratosFiltrados.map((c) => (
                <tr key={c.id} className="text-center border-b border-gray-700 hover:bg-gray-700">
                  <td className="px-3 py-2 border">{c.cliente}</td>
                  <td className="px-3 py-2 border">{estadosNomes[c.estado] || c.estado}</td>
                  <td className="px-3 py-2 border">
                    {parseFloat(c.valorGlobal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-3 py-2 border">
                    {parseFloat(c.valorComissao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-3 py-2 border">{c.inicio}</td>
                  <td className="px-3 py-2 border">{c.encerramento}</td>
                  <td className="px-3 py-2 border space-x-1">
                    <button
                      onClick={() => onVer(c)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => onEditar(c)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => excluirContrato(c.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {contratosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-2 text-center text-gray-400">
                    Nenhum contrato encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <button
            onClick={onVoltar}
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-2 px-4 rounded-xl"
          >
            Voltar para Cadastro
          </button>
        </div>
      </div>
    </div>
  );
}

