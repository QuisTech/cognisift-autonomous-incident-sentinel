'use client';

import { motion } from 'framer-motion';
import { Brain, ShieldCheck, Zap, RefreshCcw, FileText, Bot } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Multi-Agent AI System',
    description: 'Powered by Gemini 1.5 Pro, emulating senior analyst strategic thinking with specialized agents.',
  },
  {
    icon: Zap,
    title: 'Autonomous Execution',
    description: 'Intelligently ingests case data, executes SIFT tools, and generates hypotheses automatically.',
  },
  {
    icon: ShieldCheck,
    title: 'Evidence Integrity',
    description: 'Maintains a tamper-proof audit trail and flags potential spoliation risks in real-time.',
  },
  {
    icon: RefreshCcw,
    title: 'Cognitive Self-Correction',
    description: 'Continuously reviews findings, challenges assumptions, and suggests alternative analysis paths.',
  },
  {
    icon: FileText,
    title: 'Actionable Reporting',
    description: 'Synthesizes validated findings into comprehensive incident reports and remediation strategies.',
  },
  {
    icon: Bot,
    title: 'Custom MCP Server',
    description: 'Seamless integration with Protocol SIFT and OpenClaw for robust tool orchestration and control.',
  },
];

export const FeaturesSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 10 } }
  };

  return (
    <section id="features" className="py-20 bg-surface-dark text-text-dark">
      <div className="container mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold mb-4"
        >
          Unleash the Power of AI-Driven IR
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-text-muted max-w-2xl mx-auto mb-16"
        >
          CogniSIFT brings unprecedented speed, accuracy, and consistency to your incident response workflow.
        </motion.p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700 hover:border-primary-dark transition-all duration-300 transform hover:-translate-y-2 group"
            >
              <div className="flex items-center justify-center h-16 w-16 bg-primary/20 rounded-full mb-6 mx-auto group-hover:bg-primary-dark transition-colors duration-300">
                <feature.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-text-muted text-lg">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
