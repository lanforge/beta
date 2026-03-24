import React from 'react';
import Hero from '../components/Hero';
import ProductShowcase from '../components/ProductShowcase';
import Reviews from '../components/Reviews';
import FAQ from '../components/FAQ';
import Warranty from '../components/Warranty';

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <ProductShowcase />
      <Reviews />
      <FAQ />
      <Warranty />
    </>
  );
};

export default HomePage;
