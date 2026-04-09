import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const carouselItems = [
  {
    id: 1,
    title: "The Ultimate Data Toolkit",
    description: "Everything you need to clean, analyze, convert, and model your data in one place.",
    badge: "CMD",
    color: "from-indigo-500 to-purple-500"
  },
  {
    id: 2,
    title: "Clean & Standardize",
    description: "Instantly handle missing values, remove duplicates, and format your datasets with precision.",
    badge: "CMD",
    color: "from-blue-500 to-indigo-500"
  },
  {
    id: 3,
    title: "Powerful Visualizations",
    description: "Generate instant exploratory data analysis (EDA) reports and visualize distributions effortlessly.",
    badge: "CMD",
    color: "from-indigo-500 to-purple-500"
  },
  {
    id: 4,
    title: "Convert Formats",
    description: "Fast, secure, and free online file converters. Seamlessly switch between CSV, JSON, and Excel.",
    badge: "CMD",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: 5,
    title: "AI-Powered Insights",
    description: "Leverage advanced tools to model your data and extract actionable insights in seconds.",
    badge: "CMD",
    color: "from-indigo-500 to-purple-500"
  }
];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselItems.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 relative h-[280px] sm:h-[260px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
        >
          <div className={`bg-gradient-to-r ${carouselItems[currentIndex].color} px-6 py-2 rounded-2xl mb-8 shadow-lg shadow-indigo-200/50`}>
            <span className="text-white font-black text-3xl tracking-tight">{carouselItems[currentIndex].badge}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            {carouselItems[currentIndex].title}
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl font-medium">
            {carouselItems[currentIndex].description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 pb-2">
        {carouselItems.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-8 bg-indigo-600' : 'w-2 bg-indigo-200 hover:bg-indigo-300'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
