import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AboutPage from './AboutPage';

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

describe('AboutPage', () => {
    it('renders the AboutPage correctly', () => {
        render(
            <MemoryRouter>
                <AboutPage />
            </MemoryRouter>
        );
        
        // Assertions for main headers and content
        expect(screen.getByText('About HappyTails')).toBeInTheDocument();
        expect(screen.getByText(/We're on a mission to make every pet's life better/i)).toBeInTheDocument();
        
        // Assertions for feature boxes
        expect(screen.getByText('Our Community')).toBeInTheDocument();
        expect(screen.getByText('Trust & Safety')).toBeInTheDocument();
        expect(screen.getByText('What We Offer')).toBeInTheDocument();
        
        // Assertions for call to action
        expect(screen.getByText('Want to partner with us?')).toBeInTheDocument();
        const partnerLink = screen.getByRole('link', { name: /Become a Partner/i });
        expect(partnerLink).toBeInTheDocument();
        expect(partnerLink).toHaveAttribute('href', '/partnerRegistrataion');
    });
});
