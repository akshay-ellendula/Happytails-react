import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { WishlistProvider, useWishlist } from './WishlistContext';
import { axiosInstance } from '../utils/axios';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

// Mock Dependencies
jest.mock('../utils/axios', () => ({
  axiosInstance: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  }
}));

jest.mock('../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  }
}));

const TestComponent = () => {
    const { wishlistIds, wishlistItems, isWishlisted, toggleWishlist, loading } = useWishlist();
    
    return (
        <div>
            <div data-testid="loading">{String(loading)}</div>
            <div data-testid="wishlist-count">{wishlistItems.length}</div>
            <div data-testid="is-wishlisted-p1">{String(isWishlisted('p1'))}</div>
            <div data-testid="is-wishlisted-p2">{String(isWishlisted('p2'))}</div>
            
            <button onClick={() => toggleWishlist({ _id: 'p1', name: 'Leash' })}>Toggle P1</button>
            <button onClick={() => toggleWishlist({ _id: 'p2', name: 'Bowl' })}>Toggle P2</button>
        </div>
    );
};

describe('WishlistContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('initializes with empty wishlist for unauthenticated users', async () => {
        useAuth.mockReturnValue({ isAuthenticated: false, user: null });
        
        render(
            <WishlistProvider>
                <TestComponent />
            </WishlistProvider>
        );

        expect(screen.getByTestId('wishlist-count')).toHaveTextContent('0');
        expect(screen.getByTestId('is-wishlisted-p1')).toHaveTextContent('false');
        expect(axiosInstance.get).not.toHaveBeenCalled();
    });

    it('prevents toggling wishlist when unauthenticated', async () => {
        useAuth.mockReturnValue({ isAuthenticated: false, user: null });
        
        render(
            <WishlistProvider>
                <TestComponent />
            </WishlistProvider>
        );

        const btn = screen.getByText('Toggle P1');
        await act(async () => {
            btn.click();
        });

        expect(toast.error).toHaveBeenCalledWith('Please log in to use wishlist');
        expect(axiosInstance.post).not.toHaveBeenCalled();
    });

    it('fetches wishlist automatically on mount for authenticated customers', async () => {
        useAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'customer', customerId: 'cust123' } });
        axiosInstance.get.mockResolvedValueOnce({
            data: { success: true, wishlist: [{ _id: 'p1', name: 'Leash' }] }
        });

        let renderResult;
        await act(async () => {
            renderResult = render(
                <WishlistProvider>
                    <TestComponent />
                </WishlistProvider>
            );
        });

        expect(axiosInstance.get).toHaveBeenCalledWith('/public/cust123/wishlist');
        expect(renderResult.getByTestId('wishlist-count')).toHaveTextContent('1');
        expect(renderResult.getByTestId('is-wishlisted-p1')).toHaveTextContent('true');
    });

    it('clears wishlist state when user logs out', async () => {
        // Initial state is authenticated
        const { rerender } = render(
            <WishlistProvider>
                <TestComponent />
            </WishlistProvider>
        );

        useAuth.mockReturnValue({ isAuthenticated: false, user: null });

        // Force a rerender with new Auth context values
        await act(async () => {
            rerender(
                <WishlistProvider>
                    <TestComponent />
                </WishlistProvider>
            );
        });

        expect(screen.getByTestId('wishlist-count')).toHaveTextContent('0');
    });

    it('adds item to wishlist optimistically', async () => {
        useAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'customer', customerId: 'cust123' } });
        axiosInstance.get.mockResolvedValueOnce({ data: { success: true, wishlist: [] } }); // Initial empty fetch
        
        let renderResult;
        await act(async () => {
            renderResult = render(
                <WishlistProvider>
                    <TestComponent />
                </WishlistProvider>
            );
        });

        axiosInstance.post.mockResolvedValueOnce({ data: { success: true } });

        const btn = screen.getByText('Toggle P1');
        await act(async () => {
            btn.click();
        });

        expect(axiosInstance.post).toHaveBeenCalledWith('/public/cust123/wishlist', { productId: 'p1' });
        expect(renderResult.getByTestId('is-wishlisted-p1')).toHaveTextContent('true');
        expect(toast.success).toHaveBeenCalledWith('Added to wishlist! ❤️');
    });

    it('removes item from wishlist optimistically', async () => {
        useAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'customer', customerId: 'cust123' } });
        axiosInstance.get.mockResolvedValueOnce({ data: { success: true, wishlist: [{ _id: 'p1' }] } }); 
        
        let renderResult;
        await act(async () => {
            renderResult = render(
                <WishlistProvider>
                    <TestComponent />
                </WishlistProvider>
            );
        });

        axiosInstance.delete.mockResolvedValueOnce({ data: { success: true } });

        const btn = screen.getByText('Toggle P1');
        await act(async () => {
            btn.click();
        });

        expect(axiosInstance.delete).toHaveBeenCalledWith('/public/cust123/wishlist/p1');
        expect(renderResult.getByTestId('is-wishlisted-p1')).toHaveTextContent('false');
        expect(toast.success).toHaveBeenCalledWith('Removed from wishlist');
    });

    it('reverts optimistic update on API failure', async () => {
        useAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'customer', customerId: 'cust123' } });
        axiosInstance.get.mockResolvedValueOnce({ data: { success: true, wishlist: [] } }); // Initial empty fetch
        
        let renderResult;
        await act(async () => {
            renderResult = render(
                <WishlistProvider>
                    <TestComponent />
                </WishlistProvider>
            );
        });

        // Mock failure for post request
        axiosInstance.post.mockRejectedValueOnce(new Error('Network error'));

        const btn = screen.getByText('Toggle P2');
        await act(async () => {
            btn.click();
        });

        expect(toast.error).toHaveBeenCalledWith('Failed to update wishlist');
        // Because of optimistic rollback, it should not be wishlisted anymore
        expect(renderResult.getByTestId('is-wishlisted-p2')).toHaveTextContent('false');
        expect(renderResult.getByTestId('wishlist-count')).toHaveTextContent('0');
    });

    it('ignores API fetch entirely for storePartners and eventManagers', async () => {
        useAuth.mockReturnValue({ isAuthenticated: true, user: { role: 'storePartner', id: 'store123' } });
        
        let renderResult;
        await act(async () => {
            renderResult = render(
                <WishlistProvider>
                    <TestComponent />
                </WishlistProvider>
            );
        });

        expect(axiosInstance.get).not.toHaveBeenCalled();
        expect(renderResult.getByTestId('wishlist-count')).toHaveTextContent('0');
    });
});
