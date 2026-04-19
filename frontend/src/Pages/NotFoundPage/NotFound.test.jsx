import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from './NotFound';

// Mock window.history.back
const originalBack = window.history.back;
beforeAll(() => {
    window.history.back = jest.fn();
});
afterAll(() => {
    window.history.back = originalBack;
});

describe('NotFound Page', () => {
    it('renders the 404 page content and handles Document Title', () => {
        render(
            <MemoryRouter>
                <NotFound />
            </MemoryRouter>
        );
        
        // Assertions for main display text
        expect(screen.getByText(/Oops! You're Off the Leash/i)).toBeInTheDocument();
        expect(screen.getByText(/The page you are looking for seems to have wandered away/i)).toBeInTheDocument();
        
        // Assertions for Buttons
        const goBackBtn = screen.getByRole('button', { name: /Go Back/i });
        const homeLink = screen.getByRole('link', { name: /Back to Home/i });

        expect(goBackBtn).toBeInTheDocument();
        expect(homeLink).toBeInTheDocument();
        expect(homeLink).toHaveAttribute('href', '/');

        // Test Go Back functionality
        act(() => {
            goBackBtn.click();
        });
        expect(window.history.back).toHaveBeenCalledTimes(1);

        // Verify document title
        expect(document.title).toBe("404 - Page Not Found | HappyTails");
    });
});
