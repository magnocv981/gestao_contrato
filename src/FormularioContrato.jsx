import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

const estadosNomes = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia',
  CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
  MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais',
  PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí',
  RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul',
  RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo',
  SE: 'Sergipe', TO: 'Tocantins'
};

export default function FormularioContrato({ contrato, onSalvar, onCancelar }) {
  const [form, setForm] = useState({
    cliente: '',
    estado: 'SP',
    valorGlobal: '',
    valorComissao: '',
    objeto: '',
    qtdElevadores: '',
    qtdPlataformas: '',
    inicio: '',
    encerramento: '',
    necessitaArt: false,
    gestor: '',
    telefone: '',
    email: '',
  });

  useEffect(() => {
    if (contrato) {
      setForm({
        cliente: contrato.cliente || '',
        estado: contrato.estado || 'SP',
        valorGlobal: contrato.valorGlobal || '',
        valorComissao: contrato.valorComissao || '',
        objeto: contrato.objeto || '',
        qtdElevadores: contrato.qtdElevadores || '',
        qtdPlataformas: contrato.qtdPlataformas || '',
        inicio: contrato.inicio || '',
        encerramento: contrato.encerramento || '',
        necessitaArt: contrato.necessitaArt || false,
        gestor: contrato.gestor || '',
        telefone: contrato.telefone || '',
        email: contrato.email || '',
      });
    } else {
      setForm({
        cliente: '',
        estado: 'SP',
        valorGlobal: '',
        valorComissao: '',
        objeto: '',
        qtdElevadores: '',
        qtdPlataformas: '',
        inicio: '',
        encerramento: '',
        necessitaArt: false,
        gestor: '',
        telefone: '',
        email: '',
      });
    }
  }, [contrato]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação simples
    if (!form.cliente.trim()) {
      alert('Informe o nome do cliente.');
      return;
    }

    try {
      if (contrato && contrato.id) {
        // Atualizar contrato existente
        const contratoRef = doc(db, 'contratos', contrato.id);
        await updateDoc(contratoRef, form);
        alert('Contrato atualizado com sucesso!');
      } else {
        // Criar novo contrato
        const contratosRef = collection(db, 'contratos');
        await addDoc(contratosRef, form);
        alert('Contrato criado com sucesso!');
      }
      onSalvar();
    } catch (error) {
      console.error('Erro ao salvar contrato:', error);
      alert('Erro ao salvar contrato. Tente novamente.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 p-6 text-gray-100">
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-6">
          {contrato ? 'Editar Contrato' : 'Novo Contrato'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold" htmlFor="cliente">Cliente *</label>
            <input
              type="text"
              id="cliente"
              name="cliente"
              value={form.cliente}
              onChange={handleChange}
              className="w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="estado">Estado</label>
            <select
              id="estado"
              name="estado"
              value={form.estado}
              onChange={handleChange}
              className="w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-gray-100"
            >
              {Object.entries(estadosNomes).map(([sigla, nome]) => (
                <option key={sigla} value={sigla}>{nome}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold" htmlFor="valorGlobal">Valor Global (R$)</label>
              <input
                type="number"
                id="valorGlobal"
                name="valorGlobal"
                value={form.valorGlobal}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-gray-100"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold" htmlFor="valorComissao">Comissão (R$)</label>
              <input
                type="number"
                id="valorComissao"
                name="valorComissao"
                value={form.valorComissao}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="objeto">Objeto do Contrato</label>
            <textarea
              id="objeto"
              name="objeto"
              value={form.objeto}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-gray-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold" htmlFor="qtdElevadores">Quantidade de Elevadores</label>
              <input
                type="number"
                id="qtdElevadores"
                name="qtdElevadores"
                value={form.qtdElevadores}
                onChange={handleChange}
                min="0"
                className="w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-gray-100"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold" htmlFor="qtdPlataformas">Quantidade de Plataformas</label>
              <input
                type="number"
                id="qtdPlataformas"
                name="qtdPlataformas"
                value={form.qtdPlataformas}
                onChange={handleChange}
                min="0"
                className="w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold" htmlFor="inicio">Data de Início</label>
              <input
                type="date"
                id="inicio"
                name="inicio"
                value={form.inicio}
                onChange={handleChange}
                className="w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-gray-100"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold" htmlFor="encerramento">Data de Encerramento</label>
              <input
                type="date"
                id="encerramento"
                name="encerramento"
                value={form.encerramento}
                onChange={handleChange}
                className="w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-gray-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="necessitaArt"
              name="necessitaArt"
              checked={form.necessitaArt}
              onChange={handleChange}
              className="accent-green-500"
            />
            <label htmlFor="necessitaArt" className="font-semibold">Necessita ART</label>
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="gestor">Gestor</label>
            <input
              type="text"
              id="gestor"
              name="gestor"
              value={form.gestor}
              onChange={handleChange}
              className="w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-gray-100"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="telefone">Telefone</label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              className="w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-gray-100"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-md bg-gray-700 border border-gray-600 p-2 text-gray-100"
            />
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-xl"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={onCancelar}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-xl"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}







