'use client';

import React from 'react';
import { useTranslation } from 'react-i18next'; // 👈 Importamos el hook

interface NavbarProps {
  onNavigate?: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { t } = useTranslation(); // 👈 Inicializamos t

  const navItems = [
    { id: 'home', label: t('ui.inicio') },
    { id: 'series', label: t('ui.series') },
    { id: 'personajes', label: t('ui.personajes') },
    { id: 'reviews', label: t('ui.reviews') }
  ];

  return (
    <nav style={{
      background: '#020617',
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
    }}>
      <h1 
        style={{
          color: '#38bdf8',
          margin: 0,
          fontSize: '24px',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={() => onNavigate?.('home')}
      >
        {t('ui.series').toUpperCase()} TELEVISIVAS {/* O una clave personalizada si gustas */}
      </h1>
      <div style={{
        display: 'flex',
        gap: '20px',
        color: '#94a3b8',
        cursor: 'pointer',
      }}>
        {navItems.map((item) => (
          <span 
            key={item.id} 
            onClick={() => onNavigate?.(item.id)}
            style={{ transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            {item.label}
          </span>
        ))}
      </div>
    </nav>
  );
};