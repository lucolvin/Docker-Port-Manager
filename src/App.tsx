import React, { useState, useEffect } from 'react';

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

  // Use environment-specific API base URL
  // In development (localhost), connect to localhost:3001, in production use nginx proxy (empty string)
  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

  useEffect(() => {
    fetchPortData();
  }, []);

  const fetchPortData = async () => {
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
  };

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

  const filteredPorts = portData.usedPorts.filter(port => 
    port.toString().includes(searchTerm)
  );

  const filteredContainers = portData.containers.filter(container =>
    container.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    container.image.toLowerCase().includes(searchTerm.toLowerCase()) ||
    container.ports.some(port => port.hostPort.toString().includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Docker Port Manager
          </h1>
          <p className="text-slate-600 text-lg">
            Monitor and manage Docker container ports on your server
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Search Ports or Containers
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter port number or container name..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Port Check */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
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
              <label className="block text-sm font-medium text-slate-700">
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
                  ? 'bg-green-50 border-green-400' 
                  : 'bg-red-50 border-red-400'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Port {portCheck.port}
                    </h3>
                    <p className={`text-sm ${
                      portCheck.available ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {portCheck.available ? '✓ Available' : '✗ In Use'}
                    </p>
                    {portCheck.usedBy && (
                      <p className="text-sm text-slate-600 mt-1">
                        Used by: {portCheck.usedBy.container} ({portCheck.usedBy.containerPort})
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Random Port Result */}
            {randomPort && (
              <div className="p-4 rounded-lg border-l-4 bg-green-50 border-green-400">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Random Free Port
                    </h3>
                    <p className="text-2xl font-bold text-green-700 mt-1">
                      {randomPort}
                    </p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(randomPort.toString())}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">
              {error}
            </p>
            <button
              onClick={fetchPortData}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Loading Docker container information...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Used Ports Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Used Ports ({filteredPorts.length})
              </h2>
              {filteredPorts.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  {searchTerm ? 'No ports match your search' : 'No ports currently in use'}
                </p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {filteredPorts.map(port => (
                    <div
                      key={port}
                      className="px-3 py-2 bg-slate-100 rounded-lg text-center font-mono text-sm text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      {port}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Container Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Container Details ({filteredContainers.length})
              </h2>
              {filteredContainers.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  {searchTerm ? 'No containers match your search' : 'No containers with exposed ports'}
                </p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredContainers.map(container => (
                    <div
                      key={container.id}
                      className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-800">
                            {container.name}
                          </h3>
                          <p className="text-sm text-slate-600">
                            {container.image}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            ID: {container.id}
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {container.status.split(' ')[0]}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {container.ports.map((port, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-slate-600">
                              Container: {port.containerPort}
                            </span>
                            <span className="font-mono text-slate-800">
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
            className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:bg-slate-400 transition-colors font-medium"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
