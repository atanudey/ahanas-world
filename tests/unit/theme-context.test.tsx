import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { THEMES } from '@/lib/theme';

/**
 * Tests for the theme store backing ThemeProvider/useTheme. Exercises the real
 * component: default mode, persistence to localStorage, restoring a stored
 * theme, the toggle cycle order, and the <html data-theme> side effect.
 */

function Probe() {
  const { mode, theme, setTheme, toggle } = useTheme();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="theme-name">{theme.name}</span>
      <button onClick={toggle}>toggle</button>
      <button onClick={() => setTheme('minecraft')}>set-minecraft</button>
    </div>
  );
}

function renderProbe() {
  return render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('defaults to moonlit when nothing is stored', () => {
    renderProbe();
    expect(screen.getByTestId('mode')).toHaveTextContent('moonlit');
    expect(screen.getByTestId('theme-name')).toHaveTextContent(THEMES.moonlit.name);
  });

  it('restores a previously stored theme', () => {
    localStorage.setItem('ahanas-theme', 'storybook');
    renderProbe();
    expect(screen.getByTestId('mode')).toHaveTextContent('storybook');
  });

  it('ignores an invalid stored value and falls back to moonlit', () => {
    localStorage.setItem('ahanas-theme', 'neon-disco');
    renderProbe();
    expect(screen.getByTestId('mode')).toHaveTextContent('moonlit');
  });

  it('setTheme updates the mode and persists it', () => {
    renderProbe();
    act(() => {
      screen.getByText('set-minecraft').click();
    });
    expect(screen.getByTestId('mode')).toHaveTextContent('minecraft');
    expect(localStorage.getItem('ahanas-theme')).toBe('minecraft');
  });

  it('toggle cycles moonlit -> storybook -> minecraft -> moonlit', () => {
    renderProbe();
    const toggleBtn = screen.getByText('toggle');

    expect(screen.getByTestId('mode')).toHaveTextContent('moonlit');
    act(() => toggleBtn.click());
    expect(screen.getByTestId('mode')).toHaveTextContent('storybook');
    act(() => toggleBtn.click());
    expect(screen.getByTestId('mode')).toHaveTextContent('minecraft');
    act(() => toggleBtn.click());
    expect(screen.getByTestId('mode')).toHaveTextContent('moonlit');
  });

  it('sets data-theme on <html> only for the minecraft theme', () => {
    renderProbe();
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();

    act(() => {
      screen.getByText('set-minecraft').click();
    });
    expect(document.documentElement.getAttribute('data-theme')).toBe('minecraft');
  });

  it('throws when useTheme is used outside the provider', () => {
    function Orphan() {
      useTheme();
      return null;
    }
    expect(() => render(<Orphan />)).toThrow(/useTheme must be used within ThemeProvider/);
  });
});
