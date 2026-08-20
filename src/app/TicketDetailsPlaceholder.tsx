import { useParams } from 'react-router-dom';

/** Placeholder — a tela real de detalhes do chamado é a etapa seguinte deste marco. */
export function TicketDetailsPlaceholder() {
  const { ticketId } = useParams();
  return (
    <div>
      <h2>Chamado {ticketId}</h2>
      <p>Os detalhes deste chamado chegam na próxima etapa.</p>
    </div>
  );
}
