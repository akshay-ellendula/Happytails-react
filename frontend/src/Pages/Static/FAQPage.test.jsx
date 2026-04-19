import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FAQPage from './FAQPage';

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

describe('FAQPage', () => {
    it('renders the FAQPage correctly and allows toggling accordions', () => {
        render(
            <MemoryRouter>
                <FAQPage />
            </MemoryRouter>
        );
        
        expect(screen.getByRole('heading', { name: 'Frequently Asked Questions' })).toBeInTheDocument();
        
        const questionBtn = screen.getByText('What is HappyTails?');
        expect(questionBtn).toBeInTheDocument();
        
        // Assert the answer is not initially visible
        expect(screen.queryByText(/HappyTails is a platform for pet lovers/i)).not.toBeInTheDocument();
        
        // Click and assert visible
        act(() => {
            questionBtn.click();
        });
        
        expect(screen.getByText(/HappyTails is a platform for pet lovers/i)).toBeInTheDocument();
        
        // Click and hide
        act(() => {
            questionBtn.click();
        });
        expect(screen.queryByText(/HappyTails is a platform for pet lovers/i)).not.toBeInTheDocument();
    });
});
