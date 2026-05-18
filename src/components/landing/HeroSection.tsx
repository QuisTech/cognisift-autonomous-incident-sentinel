'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-background-dark to-slate-900 py-24 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6"
        >
          CogniSIFT: Autonomous Incident Sentinel
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="text-xl md:text-2xl text-text-muted max-w-3xl mx-auto mb-10"
        >
          Transforming SIFT into an intelligent, self-correcting incident response expert.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
        >
          <Link href="/dashboard">
            <button className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all duration-300 transform hover:scale-105">
              Launch Dashboard
            </button>
          </Link>
          <a
            href="#features"
            className="bg-transparent border border-primary text-primary hover:bg-primary hover:text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
          >
            Learn More
          </a>
        </motion.div>

        {/* Animated demonstration placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }}
          className="mt-20 relative w-full h-80 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div> {/* Grid pattern for tech feel */}
          <p className="text-text-muted text-lg z-10">
            [Animated Demonstration of Agent Workflow - Placeholder]
          </p>
        </motion.div>
      </div>
    </section>
  );
};
