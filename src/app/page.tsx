'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ResultsGrid } from '@/components/ResultsGrid';
import { DetailView } from '@/components/DetailView';
import { useSearch } from '@/hooks/useSearch';
import { Serie } from '@/interfaces/series.interface';

type View = 'home' | 'results' | 'detail';

export default function HomePage() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedItem, setSelectedItem] = useState<Serie | null>(null);
  const { results, loading, search, filterByCategory } = useSearch();

  const handleSearch = (query: string) => {
    search(query);
    setCurrentView('results');
  };

  const handleCategoryClick = (category: string) => {
    filterByCategory(category);
    setCurrentView('results');
  };

  const handleCardClick = (item: Serie) => {
    setSelectedItem(item);
    setCurrentView('detail');
  };

  const handleBack = () => {
    setCurrentView('results');
    setSelectedItem(null);
  };

  const handleNavigate = (page: string) => {
    if (page === 'home') {
      setCurrentView('home');
      setSelectedItem(null);
    } else if (page === 'series') {
      filterByCategory('Serie');
      setCurrentView('results');
    } else if (page === 'personajes') {
      filterByCategory('Personaje');
      setCurrentView('results');
    } else if (page === 'reviews') {
      filterByCategory('Review');
      setCurrentView('results');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      color: 'white'
    }}>
      <Navbar onNavigate={handleNavigate} />
      
      {currentView === 'home' && (
        <Hero onSearch={handleSearch} onCategoryClick={handleCategoryClick} />
      )}
      
      {currentView === 'results' && (
        <ResultsGrid
          results={results}
          onCardClick={handleCardClick}
          loading={loading}
        />
      )}
      
      {currentView === 'detail' && selectedItem && (
        <DetailView item={selectedItem} onBack={handleBack} />
      )}
    </div>
  );
}