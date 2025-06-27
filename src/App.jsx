import { useState } from 'react';
import Dashboard from './Dashboard';
import FormularioContrato from './FormularioContrato';
import DetalhesContrato from './DetalhesContrato';

export default function App() {
  const [modo, setModo] = useState('dashboard'); // dashboard | cadastro | detalhes
  const [contratoSelecionado, setContratoSelecionado] = useState(null);

  const abrirCadastro = () => {
    setContratoSelecionado(null);
    setModo('cadastro');
  };

  const abrirEdicao = (contrato) => {
    setContratoSelecionado(contrato);
    setModo('cadastro');
  };

  const abrirDetalhes = (contrato) => {
    setContratoSelecionado(contrato);
    setModo('detalhes');
  };

  const voltarDashboard = () => {
    setContratoSelecionado(null);
    setModo('dashboard');
  };

  return (
    <>
      {modo === 'dashboard' && (
        <Dashboard
          onNovoContrato={abrirCadastro}
          onEditar={abrirEdicao}
          onVer={abrirDetalhes}
        />
      )}
      {modo === 'cadastro' && (
        <FormularioContrato
          contrato={contratoSelecionado}
          onSalvar={() => voltarDashboard()}
          onCancelar={voltarDashboard}
        />
      )}
      {modo === 'detalhes' && (
        <DetalhesContrato
          contrato={contratoSelecionado}
          onVoltar={voltarDashboard}
          onEditar={abrirEdicao}
        />
      )}
    </>
  );
}






