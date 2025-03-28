import React, { useState, useEffect } from 'react';
import { X, Cookie, ChevronDown, ChevronUp } from 'lucide-react';

interface CookieSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const newSettings = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    saveConsent(newSettings);
  };

  const handleAcceptSelected = () => {
    saveConsent(settings);
  };

  const handleDeclineAll = () => {
    const newSettings = {
      necessary: true, // Always required
      analytics: false,
      marketing: false,
      preferences: false
    };
    saveConsent(newSettings);
  };

  const saveConsent = (selectedSettings: CookieSettings) => {
    // Save to localStorage
    localStorage.setItem('cookieConsent', JSON.stringify({
      settings: selectedSettings,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }));

    // Here you would typically:
    // 1. Send consent data to your analytics/tracking services
    // 2. Initialize or disable tracking based on user choices
    // 3. Update any related services or scripts

    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-surface-200 shadow-lg">
      <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8">
        {/* Main Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Cookie className="h-6 w-6 text-secondary-500 flex-shrink-0" />
            <p className="text-surface-600 text-sm">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 bg-surface-900 hover:bg-surface-800 text-white rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              Accept All
            </button>
            
            <button
              onClick={handleDeclineAll}
              className="px-4 py-2 bg-surface-900 hover:bg-surface-800 text-white rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              Required Only
            </button>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-4 py-2 border border-surface-900 text-surface-900 hover:bg-surface-50 rounded-lg text-sm transition-colors whitespace-nowrap flex items-center gap-1"
            >
              Choose Options
              {showDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Detailed Settings */}
        {showDetails && (
          <div className="mt-4 border-t border-surface-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Necessary Cookies */}
              <div className="bg-surface-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Necessary</h3>
                  <input
                    type="checkbox"
                    checked={settings.necessary}
                    disabled
                    className="h-4 w-4 text-secondary-500 rounded border-surface-300 focus:ring-secondary-500"
                  />
                </div>
                <p className="text-sm text-surface-600">
                  Essential for the website to function properly. Cannot be disabled.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-surface-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Analytics</h3>
                  <input
                    type="checkbox"
                    checked={settings.analytics}
                    onChange={(e) => setSettings({ ...settings, analytics: e.target.checked })}
                    className="h-4 w-4 text-secondary-500 rounded border-surface-300 focus:ring-secondary-500"
                  />
                </div>
                <p className="text-sm text-surface-600">
                  Help us understand how visitors interact with our website.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="bg-surface-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Marketing</h3>
                  <input
                    type="checkbox"
                    checked={settings.marketing}
                    onChange={(e) => setSettings({ ...settings, marketing: e.target.checked })}
                    className="h-4 w-4 text-secondary-500 rounded border-surface-300 focus:ring-secondary-500"
                  />
                </div>
                <p className="text-sm text-surface-600">
                  Used to deliver personalized advertisements and track their performance.
                </p>
              </div>

              {/* Preferences Cookies */}
              <div className="bg-surface-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Preferences</h3>
                  <input
                    type="checkbox"
                    checked={settings.preferences}
                    onChange={(e) => setSettings({ ...settings, preferences: e.target.checked })}
                    className="h-4 w-4 text-secondary-500 rounded border-surface-300 focus:ring-secondary-500"
                  />
                </div>
                <p className="text-sm text-surface-600">
                  Remember your settings and preferences for a better experience.
                </p>
              </div>
            </div>

            <div className="mt-4 text-sm text-surface-500">
              <p>
                For more information about how we use cookies and your personal data, please read our{' '}
                <a href="/privacy" className="text-secondary-500 hover:text-secondary-600 underline">
                  Privacy Policy
                </a>
                {' '}and{' '}
                <a href="/cookie-policy" className="text-secondary-500 hover:text-secondary-600 underline">
                  Cookie Policy
                </a>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}