const express = require('express');
const cors = require('cors');
const Docker = require('dockerode');

const app = express();
const port = process.env.PORT || 3001;

// Initialize Docker with error handling
let docker;
try {
  docker = new Docker({ socketPath: '/var/run/docker.sock' });
  console.log('Docker connection initialized');
} catch (error) {
  console.error('Failed to initialize Docker connection:', error);
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test Docker connection
    await docker.ping();
    res.json({ status: 'healthy', docker: 'connected' });
  } catch (error) {
    console.error('Docker health check failed:', error);
    res.status(500).json({ status: 'unhealthy', docker: 'disconnected', error: error.message });
  }
});

// Get all used ports from Docker containers
app.get('/api/ports', async (req, res) => {
  try {
    const containers = await docker.listContainers();
    const usedPorts = new Set();
    const containerInfo = [];

    for (const containerData of containers) {
      const container = docker.getContainer(containerData.Id);
      const inspect = await container.inspect();
      
      const containerPorts = [];
      if (inspect.NetworkSettings.Ports) {
        for (const [containerPort, hostBindings] of Object.entries(inspect.NetworkSettings.Ports)) {
          if (hostBindings) {
            for (const binding of hostBindings) {
              const hostPort = parseInt(binding.HostPort);
              usedPorts.add(hostPort);
              containerPorts.push({
                containerPort: containerPort,
                hostPort: hostPort,
                hostIp: binding.HostIp || '0.0.0.0'
              });
            }
          }
        }
      }

      if (containerPorts.length > 0) {
        containerInfo.push({
          id: containerData.Id.substring(0, 12),
          name: containerData.Names[0].replace('/', ''),
          image: containerData.Image,
          status: containerData.Status,
          ports: containerPorts
        });
      }
    }

    res.json({
      usedPorts: Array.from(usedPorts).sort((a, b) => a - b),
      containers: containerInfo
    });
  } catch (error) {
    console.error('Error getting Docker info:', error);
    res.status(500).json({ error: 'Failed to get Docker container information' });
  }
});

// Check if a specific port is available
app.get('/api/ports/:port/check', async (req, res) => {
  try {
    const portToCheck = parseInt(req.params.port);
    
    if (isNaN(portToCheck) || portToCheck < 1 || portToCheck > 65535) {
      return res.status(400).json({ error: 'Invalid port number' });
    }

    const containers = await docker.listContainers();
    let portInUse = false;
    let usedBy = null;

    for (const containerData of containers) {
      const container = docker.getContainer(containerData.Id);
      const inspect = await container.inspect();
      
      if (inspect.NetworkSettings.Ports) {
        for (const [containerPort, hostBindings] of Object.entries(inspect.NetworkSettings.Ports)) {
          if (hostBindings) {
            for (const binding of hostBindings) {
              if (parseInt(binding.HostPort) === portToCheck) {
                portInUse = true;
                usedBy = {
                  container: containerData.Names[0].replace('/', ''),
                  containerPort: containerPort
                };
                break;
              }
            }
          }
          if (portInUse) break;
        }
        if (portInUse) break;
      }
    }

    res.json({
      port: portToCheck,
      available: !portInUse,
      usedBy: usedBy
    });
  } catch (error) {
    console.error('Error checking port:', error);
    res.status(500).json({ error: 'Failed to check port availability' });
  }
});

// Get a random available port
app.get('/api/ports/random', async (req, res) => {
  try {
    const containers = await docker.listContainers();
    const usedPorts = new Set();

    for (const containerData of containers) {
      const container = docker.getContainer(containerData.Id);
      const inspect = await container.inspect();
      
      if (inspect.NetworkSettings.Ports) {
        for (const [containerPort, hostBindings] of Object.entries(inspect.NetworkSettings.Ports)) {
          if (hostBindings) {
            for (const binding of hostBindings) {
              usedPorts.add(parseInt(binding.HostPort));
            }
          }
        }
      }
    }

    // Generate random port between 3000-9999 (common range for development)
    let randomPort;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      randomPort = Math.floor(Math.random() * (9999 - 3000 + 1)) + 3000;
      attempts++;
    } while (usedPorts.has(randomPort) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return res.status(500).json({ error: 'Could not find available port' });
    }

    res.json({
      port: randomPort,
      available: true
    });
  } catch (error) {
    console.error('Error getting random port:', error);
    res.status(500).json({ error: 'Failed to get random port' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Docker Port Manager API running on port ${port}`);
});