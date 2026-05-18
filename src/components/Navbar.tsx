'use client';

import Link from 'next/link';
import { Bug, Home, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

export const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
      className="bg-surface-dark bg-opacity-80 backdrop-blur-md sticky top-0 z-50 shadow-lg"
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Bug className="h-8 w-8 text-primary-dark" />
          <span className="text-2xl font-bold text-text-dark">CogniSIFT</span>
        </Link>
        <div className="flex space-x-6">
          <Link href="/" className="text-text-muted hover:text-primary-dark transition-colors duration-300 flex items-center">
            <Home className="h-5 w-5 mr-1" /> Home
          </Link>
          <Link href="/dashboard" className="text-text-muted hover:text-primary-dark transition-colors duration-300 flex items-center">
            <LayoutDashboard className="h-5 w-5 mr-1" /> Dashboard
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};
