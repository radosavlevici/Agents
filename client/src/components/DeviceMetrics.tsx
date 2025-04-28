import { useState, useEffect } from 'react';
import { DeviceMetrics as DeviceMetricsType } from '../lib/realWorldOperations';
import { realWorldOps } from '../lib/realWorldOperations';

interface DeviceMetricsProps {
  deviceId: string;
  compact?: boolean;
}

const DeviceMetrics: React.FC<DeviceMetricsProps> = ({ deviceId, compact = false }) => {
  const [metrics, setMetrics] = useState<DeviceMetricsType | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load and subscribe to device metrics
  useEffect(() => {
    // Initial load
    const initialMetrics = realWorldOps.getDeviceMetrics(deviceId);
    if (initialMetrics) {
      setMetrics(initialMetrics);
    }

    // Subscribe to updates
    const handleMetricsUpdate = (updatedMetrics: DeviceMetricsType) => {
      setMetrics(updatedMetrics);
    };

    realWorldOps.onMetricsUpdate(deviceId, handleMetricsUpdate);

    return () => {
      realWorldOps.offMetricsUpdate(deviceId, handleMetricsUpdate);
    };
  }, [deviceId]);

  // Force refresh metrics
  const refreshMetrics = () => {
    setRefreshing(true);
    
    // Simulate refresh delay
    setTimeout(() => {
      const currentMetrics = realWorldOps.getDeviceMetrics(deviceId);
      if (currentMetrics) {
        setMetrics(currentMetrics);
      }
      setRefreshing(false);
    }, 1000);
  };

  if (!metrics) {
    return <div className="device-metrics loading">Loading device metrics...</div>;
  }

  // Format bytes to human-readable format
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Compact version of the metrics display
  if (compact) {
    return (
      <div className="device-metrics compact">
        <div className="metrics-header">
          <h4>Device Status</h4>
          <button
            className={`refresh-button ${refreshing ? 'refreshing' : ''}`}
            onClick={refreshMetrics}
            disabled={refreshing}
          >
            ↻
          </button>
        </div>
        <div className="metrics-compact-grid">
          <div className="metric">
            <div className="metric-label">CPU</div>
            <div className="metric-value">{Math.round(metrics.cpu.usage)}%</div>
          </div>
          <div className="metric">
            <div className="metric-label">Memory</div>
            <div className="metric-value">{Math.round((metrics.memory.used / metrics.memory.total) * 100)}%</div>
          </div>
          <div className="metric">
            <div className="metric-label">Storage</div>
            <div className="metric-value">{Math.round((metrics.storage.used / metrics.storage.total) * 100)}%</div>
          </div>
          {metrics.battery && (
            <div className="metric">
              <div className="metric-label">Battery</div>
              <div className="metric-value">
                {Math.round(metrics.battery.level)}%
                {metrics.battery.charging && <span className="charging-indicator">⚡</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full metrics display
  return (
    <div className="device-metrics full">
      <div className="metrics-header">
        <h3>Device Metrics</h3>
        <button
          className={`refresh-button ${refreshing ? 'refreshing' : ''}`}
          onClick={refreshMetrics}
          disabled={refreshing}
        >
          Refresh
        </button>
      </div>

      <div className="metrics-section">
        <h4>CPU</h4>
        <div className="metrics-grid">
          <div className="metric">
            <div className="metric-label">Usage</div>
            <div className="metric-value">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${Math.round(metrics.cpu.usage)}%` }}
                ></div>
              </div>
              <div className="progress-text">{Math.round(metrics.cpu.usage)}%</div>
            </div>
          </div>
          <div className="metric">
            <div className="metric-label">Temperature</div>
            <div className="metric-value">{Math.round(metrics.cpu.temperature)}°C</div>
          </div>
          <div className="metric">
            <div className="metric-label">Cores</div>
            <div className="metric-value">{metrics.cpu.cores}</div>
          </div>
        </div>
      </div>

      <div className="metrics-section">
        <h4>Memory</h4>
        <div className="metrics-grid">
          <div className="metric">
            <div className="metric-label">Usage</div>
            <div className="metric-value">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${Math.round((metrics.memory.used / metrics.memory.total) * 100)}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {Math.round((metrics.memory.used / metrics.memory.total) * 100)}%
              </div>
            </div>
          </div>
          <div className="metric">
            <div className="metric-label">Used</div>
            <div className="metric-value">{formatBytes(metrics.memory.used * 1024)}</div>
          </div>
          <div className="metric">
            <div className="metric-label">Total</div>
            <div className="metric-value">{formatBytes(metrics.memory.total * 1024)}</div>
          </div>
        </div>
      </div>

      <div className="metrics-section">
        <h4>Storage</h4>
        <div className="metrics-grid">
          <div className="metric">
            <div className="metric-label">Usage</div>
            <div className="metric-value">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${Math.round((metrics.storage.used / metrics.storage.total) * 100)}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {Math.round((metrics.storage.used / metrics.storage.total) * 100)}%
              </div>
            </div>
          </div>
          <div className="metric">
            <div className="metric-label">Used</div>
            <div className="metric-value">{formatBytes(metrics.storage.used * 1024)}</div>
          </div>
          <div className="metric">
            <div className="metric-label">Free</div>
            <div className="metric-value">{formatBytes(metrics.storage.free * 1024)}</div>
          </div>
        </div>
      </div>

      <div className="metrics-section">
        <h4>Network</h4>
        <div className="metrics-grid">
          <div className="metric">
            <div className="metric-label">Download</div>
            <div className="metric-value">{metrics.network.download.toFixed(1)} MB/s</div>
          </div>
          <div className="metric">
            <div className="metric-label">Upload</div>
            <div className="metric-value">{metrics.network.upload.toFixed(1)} MB/s</div>
          </div>
          <div className="metric">
            <div className="metric-label">Latency</div>
            <div className="metric-value">{Math.round(metrics.network.latency)} ms</div>
          </div>
        </div>
      </div>

      {metrics.battery && (
        <div className="metrics-section">
          <h4>Battery</h4>
          <div className="metrics-grid">
            <div className="metric">
              <div className="metric-label">Level</div>
              <div className="metric-value">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.round(metrics.battery.level)}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {Math.round(metrics.battery.level)}%
                  {metrics.battery.charging && <span className="charging-indicator">⚡</span>}
                </div>
              </div>
            </div>
            <div className="metric">
              <div className="metric-label">Status</div>
              <div className="metric-value">{metrics.battery.charging ? 'Charging' : 'Discharging'}</div>
            </div>
            {metrics.battery.timeRemaining && (
              <div className="metric">
                <div className="metric-label">Time Remaining</div>
                <div className="metric-value">
                  {Math.floor(metrics.battery.timeRemaining / 60)}h {Math.round(metrics.battery.timeRemaining % 60)}m
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceMetrics;