import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PrivacyPage from './PrivacyPage';

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

describe('PrivacyPage', () => {
    it('renders the PrivacyPage correctly', () => {
        render(
            <MemoryRouter>
                <PrivacyPage />
            </MemoryRouter>
        );
        
        expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument();
        expect(screen.getByText(/1. Information We Collect/i)).toBeInTheDocument();
        expect(screen.getByText(/2. How We Use Your Information/i)).toBeInTheDocument();
        expect(screen.getByText(/We do not sell your personal information/i)).toBeInTheDocument();
        expect(screen.getByText(/8. Changes to This Policy/i)).toBeInTheDocument();
    });
});
