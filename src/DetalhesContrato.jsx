export default function DetalhesContrato({ contrato, onVoltar, onEditar }) {
  if (!contrato) return null;

  return (
    <main className="min-h-screen bg-gray-900 p-6 text-gray-100">
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Detalhes do Contrato</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><strong>Cliente:</strong> {contrato.cliente}</div>
          <div><strong>Estado:</strong> {contrato.estado}</div>
          <div><strong>Valor Global:</strong> R$ {parseFloat(contrato.valorGlobal).toLocaleString('pt-BR')}</div>
          <div><strong>Comissão:</strong> R$ {parseFloat(contrato.valorComissao).toLocaleString('pt-BR')}</div>
          <div><strong>Objeto:</strong> {contrato.objeto}</div>
          <div><strong>Elevadores:</strong> {contrato.qtdElevadores}</div>
          <div><strong>Plataformas:</strong> {contrato.qtdPlataformas}</div>
          <div><strong>Início:</strong> {contrato.inicio}</div>
          <div><strong>Encerramento:</strong> {contrato.encerramento}</div>
          <div><strong>Necessita ART:</strong> {contrato.necessitaArt ? 'Sim' : 'Não'}</div>
          {contrato.gestor && <div><strong>Gestor:</strong> {contrato.gestor}</div>}
          {contrato.telefone && <div><strong>Telefone:</strong> {contrato.telefone}</div>}
          {contrato.email && <div><strong>E-mail:</strong> {contrato.email}</div>}
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={() => onEditar(contrato)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-xl"
          >
            Editar Contrato
          </button>
          <button
            onClick={onVoltar}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-xl"
          >
            Voltar
          </button>
        </div>
      </div>
    </main>
  );
}


