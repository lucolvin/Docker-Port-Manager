import { useState, useEffect, useCallback } from 'react';

interface Port {
  containerPort: string;
  hostPort: number;
  hostIp: string;
}

interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  ports: Port[];
}

interface PortData {
  usedPorts: number[];
  containers: Container[];
}

interface PortCheck {
  port: number;
  available: boolean;
  usedBy?: {
    container: string;
    containerPort: string;
    state?: string;
  };
}

function App() {
  const [portData, setPortData] = useState<PortData>({ usedPorts: [], containers: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [portCheck, setPortCheck] = useState<PortCheck | null>(null);
  const [checkingPort, setCheckingPort] = useState(false);
  const [randomPort, setRandomPort] = useState<number | null>(null);
  const [generatingPort, setGeneratingPort] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Use environment-specific API base URL
  // Only use localhost:3001 when running Vite dev server (port 5173 or 3000)
  // In all other cases (including Docker on port 8080), use nginx proxy (empty string)
  const isDevelopment = window.location.port === '5173' || window.location.port === '3000';
  const API_BASE = isDevelopment ? 'http://localhost:3001' : '';
  
  // Debug logging
  console.log('Current location:', window.location.href);
  console.log('Port detected:', window.location.port);
  console.log('Is development:', isDevelopment);
  console.log('API_BASE:', API_BASE);

  const fetchPortData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/api/ports`);
      if (!response.ok) {
        throw new Error('Failed to fetch port data');
      }
      const data = await response.json();
      setPortData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load port data');
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchPortData();
  }, [fetchPortData]);

  const checkPort = async () => {
    if (!searchTerm.trim()) return;
    
    const portNumber = parseInt(searchTerm.trim());
    if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
      setPortCheck({
        port: portNumber,
        available: false,
        usedBy: { container: 'Invalid', containerPort: 'Invalid port number (1-65535)' }
      });
      return;
    }

    try {
      setCheckingPort(true);
      const response = await fetch(`${API_BASE}/api/ports/${portNumber}/check`);
      if (!response.ok) {
        throw new Error('Failed to check port');
      }
      const data = await response.json();
      setPortCheck(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check port');
    } finally {
      setCheckingPort(false);
    }
  };

  const generateRandomPort = async () => {
    try {
      setGeneratingPort(true);
      const response = await fetch(`${API_BASE}/api/ports/random`);
      if (!response.ok) {
        throw new Error('Failed to generate random port');
      }
      const data = await response.json();
      setRandomPort(data.port);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate random port');
    } finally {
      setGeneratingPort(false);
    }
  };

  const filteredPorts = portData.usedPorts.filter((port: number) => 
    port.toString().includes(searchTerm)
  );

  const filteredContainers = portData.containers.filter((container: Container) =>
    container.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    container.image.toLowerCase().includes(searchTerm.toLowerCase()) ||
    container.ports.some((port: Port) => port.hostPort.toString().includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 transition-colors">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Docker Port Manager
          </h1>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Controls */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mb-8 border border-slate-200 dark:border-slate-700 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Search Ports or Containers
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                placeholder="Enter port number or container name..."
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
              />
            </div>

            {/* Port Check */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Check Port Availability
              </label>
              <button
                onClick={checkPort}
                disabled={checkingPort || !searchTerm.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {checkingPort ? 'Checking...' : 'Check Port'}
              </button>
            </div>

            {/* Random Port */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Get Random Free Port
              </label>
              <button
                onClick={generateRandomPort}
                disabled={generatingPort}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {generatingPort ? 'Generating...' : 'Generate Port'}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="mt-6 space-y-4">
            {/* Port Check Result */}
            {portCheck && (
              <div className={`p-4 rounded-lg border-l-4 ${
                portCheck.available 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-400' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-400'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                      Port {portCheck.port}
                    </h3>
                    <p className={`text-sm ${
                      portCheck.available ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                    }`}>
                      {portCheck.available ? '✓ Available' : '✗ In Use'}
                    </p>
                    {portCheck.usedBy && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Used by: {portCheck.usedBy.container} ({portCheck.usedBy.containerPort})
                        {portCheck.usedBy.state && (
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            portCheck.usedBy.state === 'running' 
                              ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400' 
                              : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400'
                          }`}>
                            {portCheck.usedBy.state}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Random Port Result */}
            {randomPort && (
              <div className="p-4 rounded-lg border-l-4 bg-green-50 dark:bg-green-900/20 border-green-400">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                      Random Free Port
                    </h3>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400 mt-1">
                      {randomPort}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(randomPort.toString());
                      setCopiedItems(prev => new Set([...prev, `random-${randomPort}`]));
                      setTimeout(() => {
                        setCopiedItems(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(`random-${randomPort}`);
                          return newSet;
                        });
                      }, 2000);
                    }}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      copiedItems.has(`random-${randomPort}`)
                        ? 'bg-green-800 text-white'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {copiedItems.has(`random-${randomPort}`) ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-400">
              {error}
            </p>
            <button
              onClick={fetchPortData}
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading Docker container information...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Used Ports Summary */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700 transition-colors">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                Used Ports ({filteredPorts.length})
              </h2>
              {filteredPorts.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                  {searchTerm ? 'No ports match your search' : 'No ports currently in use'}
                </p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {filteredPorts.map(port => (
                    <div
                      key={port}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-center font-mono text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      {port}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Container Details */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-700 transition-colors">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                Container Details ({filteredContainers.length})
              </h2>
              {filteredContainers.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                  {searchTerm ? 'No containers match your search' : 'No containers with exposed ports'}
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredContainers.map(container => (
                    <div
                      key={container.id}
                      className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                            {container.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {container.image}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            ID: {container.id}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          container.state === 'running' 
                            ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-400' 
                            : container.state === 'exited' || container.state === 'stopped'
                            ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400'
                        }`}>
                          {container.state || container.status.split(' ')[0]}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {container.ports.map((port, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-slate-600 dark:text-slate-400">
                              Container: {port.containerPort}
                            </span>
                            <span className="font-mono text-slate-800 dark:text-slate-200">
                              → {port.hostIp}:{port.hostPort}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <button
            onClick={fetchPortData}
            disabled={loading}
            className="px-6 py-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400 text-white rounded-lg transition-colors font-medium"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
