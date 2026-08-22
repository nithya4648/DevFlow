import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectsPage from '../pages/ProjectsPage';

jest.mock('../services/api');

describe('ProjectsPage', () => {
  const queryClient = new QueryClient();

  test('renders projects list when data loads', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ProjectsPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: /projects/i })).toBeInTheDocument();
  });

  test('displays create project button', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ProjectsPage />
        </BrowserRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole('button', { name: /new project/i })).toBeInTheDocument();
  });
});
