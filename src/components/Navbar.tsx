'use client';

import React from 'react';

interface NavbarProps {
  onNavigate?: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
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
      <h1 style={{
        color: '#38bdf8',
        margin: 0,
        fontSize: '24px',
        cursor: 'pointer'
      }}
      onClick={() => onNavigate?.('home')}>
        SERIES TELEVISIVAS
      </h1>
      <div style={{
        display: 'flex',
        gap: '20px',
        color: '#94a3b8',
        cursor: 'pointer'
      }}>
        <span 
          onClick={() => onNavigate?.('home')}
          style={{ transition: 'color 0.3s' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#38bdf8'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          Inicio
        </span>
        <span 
          onClick={() => onNavigate?.('series')}
          style={{ transition: 'color 0.3s' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#38bdf8'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          Series
        </span>
        <span 
          onClick={() => onNavigate?.('personajes')}
          style={{ transition: 'color 0.3s' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#38bdf8'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          Personajes
        </span>
        <span 
          onClick={() => onNavigate?.('reviews')}
          style={{ transition: 'color 0.3s' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#38bdf8'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          Reviews
        </span>
      </div>
    </nav>
  );
};