import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { SocketContextProvider } from './contexts/SocketContext';
import routesConfig from './routes/routesConfig';
import { logoutSuccess } from './store/authSlice';

// Create TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Configure React Router
const router = createBrowserRouter(routesConfig);

export const App: React.FC = () => {
  // Listen to programmatic logout events from Axios Client token failures
  React.useEffect(() => {
    const handleLogoutEvent = () => {
      store.dispatch(logoutSuccess());
      // programmatically refresh location to redirect to /login via AuthGuard
      window.location.href = '/login';
    };

    window.addEventListener('keystone_auth_logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('keystone_auth_logout', handleLogoutEvent);
    };
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider maxSnack={3}>
          <ThemeContextProvider>
            <SocketContextProvider>
              <RouterProvider router={router} />
            </SocketContextProvider>
          </ThemeContextProvider>
        </SnackbarProvider>
      </QueryClientProvider>
    </Provider>
  );
};
export default App;
