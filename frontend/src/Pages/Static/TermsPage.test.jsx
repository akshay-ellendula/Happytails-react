import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TermsPage from './TermsPage';

jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        isAuthenticated: false,
        user: null,
        signout: jest.fn(),
    })
}));

jest.mock('../../context/CartContext', () => ({
    useCart: () => ({
        openCart: jest.fn(),
        cart: [],
        cartTotal: 0
    })
}));

describe('TermsPage', () => {
    it('renders the TermsPage correctly', () => {
        render(
            <MemoryRouter>
                <TermsPage />
            </MemoryRouter>
        );
        
        expect(screen.getByRole('heading', { name: 'Terms & Conditions' })).toBeInTheDocument();
        expect(screen.getByText(/1. Acceptance of Terms/i)).toBeInTheDocument();
        expect(screen.getByText(/2. User Accounts/i)).toBeInTheDocument();
        expect(screen.getByText(/7. Intellectual Property/i)).toBeInTheDocument();
        expect(screen.getByText(/9. Changes to Terms/i)).toBeInTheDocument();
    });
});
