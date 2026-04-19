import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { axiosInstance } from '../utils/axios';

// Mock dependencies
jest.mock('../utils/axios', () => ({
  axiosInstance: {
    post: jest.fn(),
    get: jest.fn(),
    interceptors: {
      response: {
        use: jest.fn(),
        eject: jest.fn(),
      }
    }
  }
}));

jest.mock('react-hot-toast', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    }
}));

const TestComponent = () => {
    const { isAuthenticated, user, loading, signin, signout } = useAuth();
    
    return (
        <div>
            <div data-testid="auth-status">{String(isAuthenticated)}</div>
            <div data-testid="loading-status">{String(loading)}</div>
            <div data-testid="user-data">{user ? user.role : 'none'}</div>
            
            <button onClick={() => signin({ email: 'test@example.com', password: '123' }, 'customer')}>
                Sign In
            </button>
            <button onClick={() => signout()}>
                Sign Out
            </button>
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('initializes as loading and checks verify endpoint', async () => {
        axiosInstance.get.mockResolvedValueOnce({
            data: { authenticated: true, user: { _id: '123', role: 'customer' } }
        });
        axiosInstance.get.mockResolvedValueOnce({
            data: { extraProfileData: true }
        }); // Public endpoint fetch

        let renderResult;
        await act(async () => {
            renderResult = render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );
        });
        
        expect(axiosInstance.get).toHaveBeenCalledWith('/auth/verify');
        expect(renderResult.getByTestId('auth-status')).toHaveTextContent('true');
        expect(renderResult.getByTestId('loading-status')).toHaveTextContent('false');
        expect(renderResult.getByTestId('user-data')).toHaveTextContent('customer');
    });

    it('handles signin flow successfully', async () => {
        // Initial mount verify fails
        axiosInstance.get.mockRejectedValueOnce(new Error('unauthorized'));
        
        let renderResult;
        await act(async () => {
            renderResult = render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );
        });

        expect(renderResult.getByTestId('auth-status')).toHaveTextContent('false');

        // Setup successful signin
        axiosInstance.post.mockResolvedValueOnce({
            data: { user: { _id: '123', role: 'customer' } }
        });
        axiosInstance.get.mockResolvedValueOnce({
            data: { profile: 'details' }
        });

        const signinBtn = renderResult.getByText('Sign In');
        await act(async () => {
            signinBtn.click();
        });

        expect(axiosInstance.post).toHaveBeenCalledWith('/auth/signin', { email: 'test@example.com', password: '123' });
        expect(renderResult.getByTestId('auth-status')).toHaveTextContent('true');
    });

    it('handles signout flow correctly', async () => {
        // Initial mount verify falls back to unauthorized
        axiosInstance.get.mockRejectedValueOnce(new Error('unauthorized'));
        
        let renderResult;
        await act(async () => {
            renderResult = render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );
        });

        // Setup mock for logout
        axiosInstance.post.mockResolvedValueOnce({});

        const signoutBtn = renderResult.getByText('Sign Out');
        await act(async () => {
            signoutBtn.click();
        });

        expect(axiosInstance.post).toHaveBeenCalledWith('/auth/logout');
        expect(renderResult.getByTestId('auth-status')).toHaveTextContent('false');
    });
});
