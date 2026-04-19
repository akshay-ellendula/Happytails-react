import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

// Mock dependencies
jest.mock('../utils/axios', () => ({
  axiosInstance: {
    post: jest.fn(),
    get: jest.fn(),
  }
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  }
}));

// Test harness component
const TestComponent = () => {
    const { cart, addToCart, removeItem, updateQuantity, calculateTotals, clearCart } = useCart();
    
    return (
        <div>
            <div data-testid="cart-length">{cart.length}</div>
            <button onClick={() => addToCart({ id: 'p1', product_name: 'Dog Food' }, { variant_id: 'v1', stock_quantity: 10, regular_price: 100 }, 1)}>
                Add Item
            </button>
            <button onClick={() => addToCart({ id: 'p1', product_name: 'Dog Food' }, { variant_id: 'v1', stock_quantity: 1, regular_price: 100 }, 2)}>
                Add Out Of Stock
            </button>
            <button onClick={() => cart.length > 0 && updateQuantity(0, 5)}>Update Quantity</button>
            <button onClick={() => cart.length > 0 && removeItem(0)}>Remove First Item</button>
            <button onClick={clearCart}>Clear Cart</button>
            <div data-testid="totals">{JSON.stringify(calculateTotals())}</div>
        </div>
    );
};

describe('CartContext', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    it('initializes with an empty cart', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );
        expect(screen.getByTestId('cart-length')).toHaveTextContent('0');
    });

    it('adds item to cart successfully and persists to localStorage', async () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );
        
        const addButton = screen.getByText('Add Item');
        await act(async () => {
            addButton.click();
        });
        
        expect(screen.getByTestId('cart-length')).toHaveTextContent('1');
        
        // Math verification: subtotal = 100, charge = 100 * 0.04 = 4, total = 104
        const totals = JSON.parse(screen.getByTestId('totals').textContent);
        expect(totals.subtotal).toBe(100);
        expect(totals.charge).toBe(4);
        expect(totals.total).toBe(104);

        // Verify local storage is updated
        expect(localStorage.getItem('cart')).toContain('Dog Food');
    });

    it('prevents adding item when quantity exceeds stock', async () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );
        
        // Attempting to add 2 quantities but stock is 1
        const failButton = screen.getByText('Add Out Of Stock');
        await act(async () => {
            failButton.click();
        });
        
        // Cart should still be 0
        expect(screen.getByTestId('cart-length')).toHaveTextContent('0');
    });

    it('updates quantity of existing item', async () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );
        
        const addButton = screen.getByText('Add Item');
        await act(async () => {
            addButton.click();
        });
        expect(screen.getByTestId('cart-length')).toHaveTextContent('1');

        const updateBtn = screen.getByText('Update Quantity');
        await act(async () => {
            updateBtn.click();
        });
        
        // 5 * 100 = 500 subtotal
        const totals = JSON.parse(screen.getByTestId('totals').textContent);
        expect(totals.subtotal).toBe(500);
    });

    it('removes item from cart', async () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );
        
        const addButton = screen.getByText('Add Item');
        await act(async () => {
            addButton.click();
        });
        expect(screen.getByTestId('cart-length')).toHaveTextContent('1');

        const removeBtn = screen.getByText('Remove First Item');
        await act(async () => {
            removeBtn.click();
        });
        
        expect(screen.getByTestId('cart-length')).toHaveTextContent('0');
    });

    it('clears entire cart', async () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );
        
        const addButton = screen.getByText('Add Item');
        await act(async () => {
            addButton.click();
        });
        expect(screen.getByTestId('cart-length')).toHaveTextContent('1');
        
        const clearBtn = screen.getByText('Clear Cart');
        await act(async () => {
            clearBtn.click();
        });
        expect(screen.getByTestId('cart-length')).toHaveTextContent('0');
    });
});
