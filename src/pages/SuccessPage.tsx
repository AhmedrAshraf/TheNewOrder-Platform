import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Download, MessageCircle, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuantumBackground } from '../components/QuantumBackground';

export function SuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setSessionId(urlParams.get('session_id'));
  }, []);

  return (
    <div className="min-h-screen pt-20 bg-white">
      <div className="relative">
        <QuantumBackground intensity="low" className="absolute inset-0 pointer-events-none" overlay={true} />
        
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl p-8 border border-surface-200 shadow-card">
            <div className="text-center mb-8">
              <div className="bg-secondary-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-secondary-500" />
              </div>
              <h1 className="text-3xl font-bold font-poppins mb-4 bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                Payment Successful!
              </h1>
              <p className="text-lg text-surface-600">
                Thank you for your purchase. You will receive an email confirmation shortly.
              </p>
            </div>
            
            <div className="bg-surface-50 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold font-poppins mb-4 flex items-center gap-2">
                <Rocket className="h-6 w-6 text-secondary-500" />
                <span>What's Next?</span>
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-secondary-600 text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">Check Your Email</p>
                    <p className="text-surface-600">Access instructions and documentation have been sent to your inbox</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-secondary-600 text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">Visit Your Dashboard</p>
                    <p className="text-surface-600">Access your purchased tools and manage your automations</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-secondary-600 text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-surface-900">Get Support</p>
                    <p className="text-surface-600">Our team is here to help if you need any assistance</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" />
                Access Your Purchase
              </button>
              <button
                onClick={() => navigate('/marketplace')}
                className="px-6 py-3 bg-surface-100 hover:bg-surface-200 text-surface-900 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight className="h-5 w-5" />
                Back to Marketplace
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-surface-200">
              <div className="text-center">
                <p className="text-surface-600 mb-4">Need help getting started?</p>
                <button
                  onClick={() => navigate('/messages')}
                  className="inline-flex items-center gap-2 text-secondary-500 hover:text-secondary-600"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Chat with Support</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}