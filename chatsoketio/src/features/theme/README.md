# Theme Feature

Theme management with light/dark mode support using CSS custom properties.

## Structure

- **application/** - Theme context and provider (`ThemeContext`, `ThemeProvider`, `useTheme`)
- **domain/** - Theme interfaces, types, and definitions (`ITheme`, `ThemeMode`, `lightTheme`, `darkTheme`)
- **infrastructure/** - (Reserved for future theme persistence services)
- **presentation/** - UI components and styles (`ThemeToggle`, `theme.css`)
