import React from 'react';
import { Client } from '../types';
import { ClientList } from '../components/ClientList';
import { useNavigate } from 'react-router-dom';

interface ClientsPageProps {
  clients: Client[];
  onCreateClient: () => Client;
  onSelectClient: (id: string) => void;
}

const ClientsPage: React.FC<ClientsPageProps> = ({ clients, onCreateClient, onSelectClient }) => {
  const navigate = useNavigate();

  const handleCreate = () => {
    const client = onCreateClient();
    navigate(`/client/${client.id}`);
  };

  const handleSelect = (id: string) => {
    onSelectClient(id);
    navigate(`/client/${id}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <ClientList clients={clients} selectedId={undefined} onSelect={handleSelect} onCreate={handleCreate} />
    </div>
  );
};

export default ClientsPage;
