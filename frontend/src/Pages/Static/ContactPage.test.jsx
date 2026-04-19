import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ContactPage from './ContactPage';

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

describe('ContactPage', () => {
    it('renders the ContactPage correctly', () => {
        render(
            <MemoryRouter>
                <ContactPage />
            </MemoryRouter>
        );
        
        // Main title and subtitle
        expect(screen.getByRole('heading', { name: /Contact Us/i })).toBeInTheDocument();
        expect(screen.getByText(/Have a question/i)).toBeInTheDocument();
        
        // Assertions for contact info boxes
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('support@happytails.com')).toBeInTheDocument();
        
        expect(screen.getByText('Phone')).toBeInTheDocument();
        expect(screen.getByText('+91 98765 43210')).toBeInTheDocument();
        
        expect(screen.getByText('Address')).toBeInTheDocument();
        expect(screen.getByText(/Hyderabad, Telangana/i)).toBeInTheDocument();
    });
});
