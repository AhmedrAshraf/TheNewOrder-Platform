import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Github, Youtube, Layers } from 'lucide-react';
import { QuantumBackground } from '../components/QuantumBackground';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-50 border-t border-surface-200 relative">
      <QuantumBackground intensity="low" className="fixed inset-0 pointer-events-none" overlay={false} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
            <Layers className="h-8 w-8 text-secondary-500" />
              <span className="text-2xl font-bold font-poppins text-surface-900">The<span className="text-secondary-500">New</span>Order</span>
            </div>
            <p className="text-surface-600 mb-4 max-w-md">
              The #1 AI marketplace for marketing automations. Triple your output.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-surface-400 hover:text-surface-900 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-surface-400 hover:text-surface-900 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-surface-400 hover:text-surface-900 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-surface-400 hover:text-surface-900 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-surface-900 font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/marketplace" className="text-surface-600 hover:text-surface-900 transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/upload" className="text-surface-600 hover:text-surface-900 transition-colors">
                  Submit Solution
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-surface-600 hover:text-surface-900 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-surface-600 hover:text-surface-900 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-surface-900 font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-surface-600 hover:text-surface-900 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-surface-600 hover:text-surface-900 transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-surface-600 hover:text-surface-900 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-surface-600 hover:text-surface-900 transition-colors">
                  Changelog
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-surface-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-surface-600 text-sm">
              © {currentYear} The New Order. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-surface-600 hover:text-surface-900 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-surface-600 hover:text-surface-900 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-surface-600 hover:text-surface-900 transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}