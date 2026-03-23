import { render, screen } from '@testing-library/react';
import App from './App';

vi.mock('./utils/db', () => ({
    getSessions: vi.fn().mockResolvedValue([]),
    updateSession: vi.fn(),
    deleteSession: vi.fn(),
    addSession: vi.fn(),
    getSessionById: vi.fn(),
}));

test('renders the main navigation', async () => {
    window.history.pushState({}, '', '/SieumClub_revisitTracker/');
    const { container } = render(<App />);

    expect(container.querySelector('.page-wrap')).toBeInTheDocument();
    expect(await screen.findAllByRole('link')).toHaveLength(3);
});
