import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'auto';
export type ColorScheme = 'blue' | 'green' | 'purple';

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  logo: string | null;
  setLogo: (logo: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('inventory_app_theme');
    return (saved as Theme) || 'auto';
  });
  
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    const saved = localStorage.getItem('inventory_app_color_scheme');
    return (saved as ColorScheme) || 'blue';
  });
  
  const [logo, setLogo] = useState<string | null>(() => {
    return localStorage.getItem('inventory_app_logo') || null;
  });
  
  const [isDark, setIsDark] = useState(false);
  
  // Function to determine if dark mode should be active
  const shouldUseDarkMode = (currentTheme: Theme): boolean => {
    if (currentTheme === 'dark') return true;
    if (currentTheme === 'light') return false;
    // Auto mode - check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  
  // Update theme classes and dark mode detection
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'theme-blue', 'theme-green', 'theme-purple');
    
    // Determine if dark mode should be active
    const shouldBeDark = shouldUseDarkMode(theme);
    
    // Apply theme classes
    root.classList.add(shouldBeDark ? 'dark' : 'light');
    root.classList.add(`theme-${colorScheme}`);
    
    setIsDark(shouldBeDark);
    
    // Save to localStorage
    localStorage.setItem('inventory_app_theme', theme);
    localStorage.setItem('inventory_app_color_scheme', colorScheme);
  }, [theme, colorScheme]);
  
  // Save logo to localStorage
  useEffect(() => {
    if (logo) {
      localStorage.setItem('inventory_app_logo', logo);
    } else {
      localStorage.removeItem('inventory_app_logo');
    }
  }, [logo]);
  
  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
        setIsDark(e.matches);
      };
      
      // Set initial state
      const shouldBeDark = mediaQuery.matches;
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(shouldBeDark ? 'dark' : 'light');
      setIsDark(shouldBeDark);
      
      // Listen for changes
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{
      theme,
      colorScheme,
      isDark,
      setTheme,
      setColorScheme,
      logo,
      setLogo
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}