import { useState, useEffect } from 'react';

interface SettingsProps {
  darkMode: boolean;
  onDarkModeToggle: () => void;
  onBack: () => void;
}

function Settings({ darkMode, onDarkModeToggle, onBack }: SettingsProps) {
  const [baseUrl, setBaseUrl] = useState('');
  const [tempBaseUrl, setTempBaseUrl] = useState('');

  useEffect(() => {
    const savedBaseUrl = localStorage.getItem('baseUrl') || '';
    setBaseUrl(savedBaseUrl);
    setTempBaseUrl(savedBaseUrl);
  }, []);

  const handleSaveBaseUrl = () => {
    // Remove trailing slash if present
    const cleanUrl = tempBaseUrl.trim().replace(/\/$/, '');
    setBaseUrl(cleanUrl);
    localStorage.setItem('baseUrl', cleanUrl);
  };

  const handleResetBaseUrl = () => {
    setTempBaseUrl('');
    setBaseUrl('');
    localStorage.removeItem('baseUrl');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 transition-colors">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              aria-label="Go back"
            >
              <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Settings
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Appearance Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700 transition-colors">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
              Appearance
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-700 dark:text-slate-300">Dark Mode</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Toggle between light and dark themes
                </p>
              </div>
              <button
                onClick={onDarkModeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-blue-600' : 'bg-slate-300'
                }`}
                aria-label="Toggle dark mode"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Application Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700 transition-colors">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
              Application Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Base URL for Port Links
                </label>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  Set a base URL to make ports clickable (e.g., http://your-server.com or http://localhost)
                </p>
                <div className="flex space-x-3">
                  <input
                    type="url"
                    value={tempBaseUrl}
                    onChange={(e) => setTempBaseUrl(e.target.value)}
                    placeholder="http://localhost or http://your-server.com"
                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                  />
                  <button
                    onClick={handleSaveBaseUrl}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleResetBaseUrl}
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                  >
                    Clear
                  </button>
                </div>
                {baseUrl && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-400">
                      <strong>Current base URL:</strong> {baseUrl}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                      Ports will be clickable as: {baseUrl}:[port]
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
