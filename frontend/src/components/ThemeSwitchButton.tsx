import React from 'react';
import styled from 'styled-components';
import { useThemeToggle } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

const ThemeSwitchButton = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ThemeSwitch: React.FC = () => {
  const { toggle, mode } = useThemeToggle();
  
  return (
    <ThemeSwitchButton onClick={toggle} aria-label="Toggle theme">
      {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </ThemeSwitchButton>
  );
};

export default ThemeSwitch;