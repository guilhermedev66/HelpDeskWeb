import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../../test/renderApp';
import { server, CATEGORY_FIXTURES, TICKET_FIXTURES } from '../../test/server';

function seedValidSession() {
  localStorage.setItem('helpdesk.accessToken', 'fake-jwt-token');
  localStorage.setItem('helpdesk.expiresAt', new Date(Date.now() + 30 * 60 * 1000).toISOString());
}

// A listagem renderiza tabela (desktop) e cards (mobile) ao mesmo tempo — o CSS
// esconde um dos dois por breakpoint via @media, que jsdom não avalia (só aplica a
// regra base, mobile-first). Por isso os testes ficam restritos aos cards, que são
// a única das duas representações visível/acessível nesse ambiente.
async function findTicketList() {
  return within(await screen.findByRole('list', { name: 'Chamados' }));
}

describe('TicketsListPage', () => {
  it('mostra skeleton enquanto a lista carrega, sem conteúdo nem erro prematuro', async () => {
    server.use(
      http.get('/api/tickets', async () => {
        await new Promise((resolve) => setTimeout(resolve, 80));
        return HttpResponse.json({ items: [], page: 1, pageSize: 20, totalItems: 0, totalPages: 0 });
      }),
    );
    seedValidSession();
    renderApp(['/tickets']);

    await screen.findByRole('heading', { name: /chamados/i });
    expect(screen.queryByText('Nenhum chamado encontrado')).not.toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Chamados' })).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Nenhum chamado encontrado')).toBeInTheDocument();
    });
  });

  it('carrega e mostra os chamados retornados pela API', async () => {
    seedValidSession();
    renderApp(['/tickets']);

    const list = await findTicketList();
    expect(list.getByText('Impressora do 3º andar não imprime')).toBeInTheDocument();
    expect(list.getByText('Erro ao acessar VPN pelo notebook')).toBeInTheDocument();
    expect(screen.getByText(`${TICKET_FIXTURES.length} chamados no total`)).toBeInTheDocument();
  });

  it('filtra por status via querystring e reflete no resultado', async () => {
    seedValidSession();
    renderApp(['/tickets?status=Open']);

    const list = await findTicketList();
    expect(list.getByText('Erro ao acessar VPN pelo notebook')).toBeInTheDocument();
    expect(list.queryByText('Impressora do 3º andar não imprime')).not.toBeInTheDocument();
  });

  it('filtra por categoria selecionando no dropdown', async () => {
    seedValidSession();
    const user = userEvent.setup();
    renderApp(['/tickets']);

    const list = await findTicketList();
    expect(list.getByText('Impressora do 3º andar não imprime')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Categoria'), CATEGORY_FIXTURES[1].name);

    await waitFor(() => {
      expect(list.queryByText('Impressora do 3º andar não imprime')).not.toBeInTheDocument();
    });
    expect(list.getByText('Erro ao acessar VPN pelo notebook')).toBeInTheDocument();
  });

  it('mostra estado vazio quando nenhum chamado casa com os filtros', async () => {
    seedValidSession();
    renderApp(['/tickets?search=inexistente-xyz']);

    expect(await screen.findByText('Nenhum chamado encontrado')).toBeInTheDocument();
  });

  it('limpa os filtros e volta a mostrar todos os chamados', async () => {
    seedValidSession();
    const user = userEvent.setup();
    renderApp(['/tickets?status=Open']);

    const list = await findTicketList();
    expect(list.getByText('Erro ao acessar VPN pelo notebook')).toBeInTheDocument();
    expect(list.queryByText('Impressora do 3º andar não imprime')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));

    await waitFor(() => {
      expect(list.getByText('Impressora do 3º andar não imprime')).toBeInTheDocument();
    });
  });

  it('mostra erro com opção de tentar novamente quando a API falha', async () => {
    seedValidSession();
    server.use(http.get('/api/tickets', () => HttpResponse.error()));

    const user = userEvent.setup();
    renderApp(['/tickets']);

    expect(
      await screen.findByText('Não foi possível carregar os chamados. Tente novamente.'),
    ).toBeInTheDocument();

    server.resetHandlers();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    const list = await findTicketList();
    expect(list.getByText('Impressora do 3º andar não imprime')).toBeInTheDocument();
  });

  it('pagina os resultados e busca a página seguinte na API', async () => {
    seedValidSession();
    server.use(
      http.get('/api/tickets', ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get('page') ?? '1');
        const title = page === 1 ? 'Chamado da página 1' : 'Chamado da página 2';
        return HttpResponse.json({
          items: [{ ...TICKET_FIXTURES[0], id: `page-${page}`, title }],
          page,
          pageSize: 20,
          totalItems: 2,
          totalPages: 2,
        });
      }),
    );

    const user = userEvent.setup();
    renderApp(['/tickets']);

    const list = await findTicketList();
    expect(list.getByText('Chamado da página 1')).toBeInTheDocument();

    const nav = screen.getByRole('navigation', { name: 'Paginação' });
    await user.click(within(nav).getByRole('button', { name: 'Página 2' }));

    await waitFor(() => {
      expect(list.getByText('Chamado da página 2')).toBeInTheDocument();
    });
  });
});
