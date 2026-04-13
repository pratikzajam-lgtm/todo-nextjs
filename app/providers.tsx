"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ThemeContextProvider, ThemeContext } from "./context/ThemeContext"; 
import { ThemeProvider, CssBaseline } from "@mui/material";

export default function Providers({ children }: { children: ReactNode }) {
 
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContextProvider>
        <ThemeContext.Consumer>
          {({ theme }) => (
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <ToastContainer aria-label="Toast notifications" />
              {children}
            </ThemeProvider>
          )}
        </ThemeContext.Consumer>
      </ThemeContextProvider>
    </QueryClientProvider>
  )
}