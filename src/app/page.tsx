'use client';

import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background-dark to-slate-900 text-text-dark overflow-hidden">
      <HeroSection />
      <FeaturesSection />

      <section className="py-20 text-center container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold text-white mb-6"
        >
          The Future of Incident Response is Autonomous.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-text-muted max-w-3xl mx-auto mb-10"
        >
          CogniSIFT dramatically reduces response times and human error, empowering your team to focus on strategic insights.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link href="/dashboard">
            <button className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full text-lg shadow-xl transition-all duration-300 transform hover:scale-105">
              Get Started with CogniSIFT
            </button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
