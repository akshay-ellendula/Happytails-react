import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';

describe('Footer Component', () => {
    it('renders branding and primary links', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );
        
        expect(screen.getByText('HappyTails')).toBeInTheDocument();
        expect(screen.getByText('Quick Links')).toBeInTheDocument();
        expect(screen.getByText('Support')).toBeInTheDocument();
        expect(screen.getByText('List Your Event')).toBeInTheDocument();
        expect(screen.getByText(/2025 HappyTails/i)).toBeInTheDocument();
    });

    it('renders correct quick links mapping to valid paths', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );
        
        expect(screen.getByRole('link', { name: /About Us/i })).toHaveAttribute('href', '/about');
        expect(screen.getByRole('link', { name: /Pet Events/i })).toHaveAttribute('href', '/events');
        expect(screen.getByRole('link', { name: /Pet Shop/i })).toHaveAttribute('href', '/pet_accessory');
        expect(screen.getByRole('link', { name: /Service Login/i })).toHaveAttribute('href', '/service-login');
    });

    it('renders support links correctly', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );
        
        expect(screen.getByRole('link', { name: /Terms & Conditions/i })).toHaveAttribute('href', '/terms');
        expect(screen.getByRole('link', { name: /Privacy Policy/i })).toHaveAttribute('href', '/privacy');
        expect(screen.getByRole('link', { name: /Contact Us/i })).toHaveAttribute('href', '/contact');
        expect(screen.getByRole('link', { name: /FAQ/i })).toHaveAttribute('href', '/faq');
    });
});
