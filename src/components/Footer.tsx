import Link from 'next/link';
import { Bug } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-surface-dark mt-auto py-8 text-text-muted text-sm border-t border-slate-700">
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-col items-center justify-center space-y-4 mb-6">
          <Link href="/" className="flex items-center space-x-2">
            <Bug className="h-6 w-6 text-primary-dark" />
            <span className="text-xl font-semibold text-text-dark">CogniSIFT</span>
          </Link>
          <p className="max-w-xl mx-auto">Transforming SIFT into an intelligent, self-correcting incident response expert.</p>
        </div>
        <div className="flex justify-center space-x-6 mb-6">
          <Link href="#" className="hover:text-primary-dark transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-primary-dark transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-primary-dark transition-colors">Support</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} CogniSIFT. All rights reserved.</p>
      </div>
    </footer>
  );
};
