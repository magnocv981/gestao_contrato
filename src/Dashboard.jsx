import { useEffect, useState } from 'react';
import { db } from './firebase';
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';
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

export default function Dashboard({ onNovoContrato, onEditar, onVer }) {
  const [contratos, setContratos] = useState([]);
  const [filtro, setFiltro] = useState('');

  // Atualização em tempo real dos contratos
  useEffect(() => {
    const contratosRef = collection(db, 'contratos');
    const unsubscribe = onSnapshot(contratosRef, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setContratos(lista);
    });
    return () => unsubscribe();
  }, []);

  // Filtrar contratos por cliente ou estado (nome completo ou sigla)
  const contratosFiltrados = contratos.filter(c => {
    const textoBusca = filtro.toLowerCase();
    const cliente = (c.cliente || '').toLowerCase();
    const estadoSigla = (c.estado || '').toLowerCase();
    const estadoNome = (estadosNomes[c.estado] || '').toLowerCase();

    return (
      cliente.includes(textoBusca) ||
      estadoSigla.includes(textoBusca) ||
      estadoNome.includes(textoBusca)
    );
  });

  // Data atual para filtragem
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  // Cálculo total vendas do mês
  const totalVendasMes = contratos.reduce((acc, c) => {
    if (!c.inicio) return acc;
    const dataInicio = new Date(c.inicio);
    if (
      !isNaN(dataInicio.getTime()) &&
      dataInicio.getMonth() === mesAtual &&
      dataInicio.getFullYear() === anoAtual
    ) {
      return acc + (parseFloat(c.valorGlobal) || 0);
    }
    return acc;
  }, 0);

  // Contar contratos ativos (hoje entre início e encerramento)
  const contratosAtivos = contratos.filter(c => {
    if (!c.inicio || !c.encerramento) return false;
    const inicio = new Date(c.inicio);
    const encerramento = new Date(c.encerramento);
    if (isNaN(inicio.getTime()) || isNaN(encerramento.getTime())) return false;
    return inicio <= hoje && hoje <= encerramento;
  }).length;

  // Soma comissões
  const comissoesTotais = contratos.reduce((acc, c) => acc + (parseFloat(c.valorComissao) || 0), 0);

  // Soma total elevadores e plataformas
  const totalElevadores = contratos.reduce((acc, c) => acc + (parseInt(c.qtdElevadores) || 0), 0);
  const totalPlataformas = contratos.reduce((acc, c) => acc + (parseInt(c.qtdPlataformas) || 0), 0);

  // Função para excluir contrato
  const excluirContrato = async (id) => {
    if (!window.confirm('Deseja excluir este contrato?')) return;
    try {
      await deleteDoc(doc(db, 'contratos', id));
      alert('Contrato excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir contrato:', error);
      alert('Erro ao excluir contrato.');
    }
  };

  // Exportar para Excel
  const exportarParaExcel = () => {
    const dadosExportar = contratos.map((c) => ({
      Cliente: c.cliente,
      Estado: estadosNomes[c.estado] || c.estado,
      'Valor Global (R$)': parseFloat(c.valorGlobal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      'Comissão (R$)': parseFloat(c.valorComissao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      'Objeto do Contrato': c.objeto,
      Elevadores: c.qtdElevadores,
      Plataformas: c.qtdPlataformas,
      Início: c.inicio,
      Encerramento: c.encerramento,
      'Necessita ART': c.necessitaArt ? 'Sim' : 'Não',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dadosExportar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contratos');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const arquivo = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(arquivo, 'contratos.xlsx');
  };

  // Exportar para PDF
  const exportarParaPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor('#e5e7eb'); // cor clara para título
    doc.text('Gestão dos Contratos', 14, 20);

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
      head: [['Cliente', 'Estado', 'Valor Global', 'Comissão', 'Início', 'Encerramento', 'ART']],
      body: dadosTabela,
      startY: 30,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 41, 59] }, // azul escuro
      theme: 'striped',
    });

    doc.save('contratos.pdf');
  };

  // DEBUG: para verificar os totais no console
  // console.log({ totalVendasMes, contratosAtivos, comissoesTotais, totalElevadores, totalPlataformas });

  return (
    <main className="min-h-screen bg-gray-900 p-6 text-gray-100">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Gestão dos Contratos</h1>

        {/* Cards com totais */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <h2 className="text-xl font-semibold mb-2">Total de Vendas no Mês</h2>
            <p className="text-2xl font-bold text-green-400">
              {totalVendasMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <h2 className="text-xl font-semibold mb-2">Contratos Ativos</h2>
            <p className="text-2xl font-bold text-yellow-400">{contratosAtivos}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <h2 className="text-xl font-semibold mb-2">Comissões Totais</h2>
            <p className="text-2xl font-bold text-green-400">
              {comissoesTotais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <h2 className="text-xl font-semibold mb-2">Total de Elevadores</h2>
            <p className="text-2xl font-bold text-blue-400">{totalElevadores}</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-lg text-center">
            <h2 className="text-xl font-semibold mb-2">Total de Plataformas</h2>
            <p className="text-2xl font-bold text-blue-400">{totalPlataformas}</p>
          </div>
        </div>

        {/* Botão para novo contrato */}
        <div className="mb-4">
          <button
            onClick={onNovoContrato}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl"
          >
            + Novo Contrato
          </button>
        </div>

        {/* Campo filtro */}
        <input
          type="text"
          placeholder="Buscar por cliente ou estado..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          className="w-full p-2 mb-4 rounded-xl bg-gray-800 border border-gray-700 text-gray-100"
        />

        {/* Lista dos contratos */}
        <div className="overflow-x-auto bg-gray-800 rounded-xl shadow">
          <table className="min-w-full border text-sm text-gray-100">
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
              {contratosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-2 text-center text-gray-400">
                    Nenhum contrato encontrado.
                  </td>
                </tr>
              )}
              {contratosFiltrados.map((c) => (
                <tr key={c.id} className="text-center hover:bg-gray-700 cursor-pointer">
                  <td className="px-3 py-2 border" onClick={() => onVer(c)}>{c.cliente}</td>
                  <td className="px-3 py-2 border" onClick={() => onVer(c)}>{estadosNomes[c.estado] || c.estado}</td>
                  <td className="px-3 py-2 border" onClick={() => onVer(c)}>
                    {parseFloat(c.valorGlobal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-3 py-2 border" onClick={() => onVer(c)}>
                    {parseFloat(c.valorComissao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-3 py-2 border" onClick={() => onVer(c)}>{c.inicio}</td>
                  <td className="px-3 py-2 border" onClick={() => onVer(c)}>{c.encerramento}</td>
                  <td className="px-3 py-2 border space-x-1">
                    <button
                      onClick={() => onEditar(c)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded text-xs"
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
            </tbody>
          </table>
        </div>

        {/* Exportação */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={exportarParaExcel}
            className="bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-4 rounded-xl"
          >
            Exportar Excel
          </button>
          <button
            onClick={exportarParaPDF}
            className="bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-xl"
          >
            Exportar PDF
          </button>
        </div>
      </div>
    </main>
  );
}
