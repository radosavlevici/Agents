import { useState, useEffect } from 'react';

interface DeviceConnectorProps {
  onConnect: (deviceData: ConnectedDevice) => void;
  onDisconnect: () => void;
  showStatus?: boolean;
}

export interface ConnectedDevice {
  id: string;
  name: string;
  type: 'mobile' | 'laptop' | 'tablet' | 'iot' | 'other';
  model: string;
  osVersion: string;
  connectionType: 'bluetooth' | 'wifi' | 'usb' | 'cloud';
  batteryLevel?: number;
  signalStrength?: number;
  lastSeen: Date;
  status: 'connected' | 'connecting' | 'disconnected';
  ipAddress?: string;
  macAddress?: string;
  permissions: string[];
  features: string[];
}

export const DeviceConnector: React.FC<DeviceConnectorProps> = ({ 
  onConnect, 
  onDisconnect,
  showStatus = true
}) => {
  const [scanning, setScanning] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<ConnectedDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<ConnectedDevice | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'scanning' | 'connecting' | 'connected' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Simulate scanning for nearby devices
  const scanForDevices = () => {
    setScanning(true);
    setConnectionStatus('scanning');
    setErrorMessage(null);
    
    // Simulate device discovery with Apple devices (iPhone, MacBook, etc.)
    setTimeout(() => {
      const mockDevices: ConnectedDevice[] = [
        {
          id: 'apple-iphone-13-pro-D2VMW6RNW2',
          name: 'Ervin\'s iPhone',
          type: 'mobile',
          model: 'iPhone 13 Pro (MU773ZD/A)',
          osVersion: 'iOS 16.5.2',
          connectionType: 'bluetooth',
          batteryLevel: 72,
          signalStrength: 87,
          lastSeen: new Date(),
          status: 'disconnected',
          ipAddress: '192.168.1.23',
          macAddress: '00:1B:44:11:3A:B7',
          permissions: ['file-access', 'camera', 'microphone', 'location'],
          features: ['remote-control', 'file-transfer', 'screen-sharing', 'diagnostics']
        },
        {
          id: 'apple-macbook-pro-C02ZC1K7LVDQ',
          name: 'Ervin\'s MacBook Pro',
          type: 'laptop',
          model: 'MacBook Pro 16-inch (2021)',
          osVersion: 'macOS 12.6.3',
          connectionType: 'wifi',
          batteryLevel: 89,
          signalStrength: 92,
          lastSeen: new Date(),
          status: 'disconnected',
          ipAddress: '192.168.1.15',
          macAddress: '00:1B:44:22:5C:D9',
          permissions: ['full-system-access', 'camera', 'microphone', 'file-system'],
          features: ['remote-control', 'file-transfer', 'screen-sharing', 'diagnostics', 'remote-terminal']
        },
        {
          id: 'apple-ipad-pro-DMPGBJ0MF1KV',
          name: 'Ervin\'s iPad Pro',
          type: 'tablet',
          model: 'iPad Pro 12.9-inch (5th generation)',
          osVersion: 'iPadOS 15.7',
          connectionType: 'wifi',
          batteryLevel: 64,
          signalStrength: 76,
          lastSeen: new Date(),
          status: 'disconnected',
          ipAddress: '192.168.1.27',
          macAddress: '00:1B:44:33:7F:E8',
          permissions: ['file-access', 'camera', 'microphone', 'location'],
          features: ['remote-control', 'file-transfer', 'screen-sharing', 'diagnostics']
        }
      ];
      
      setAvailableDevices(mockDevices);
      setScanning(false);
      setConnectionStatus('idle');
    }, 3000);
  };

  // Connect to the selected device
  const connectToDevice = (device: ConnectedDevice) => {
    setConnectionStatus('connecting');
    setErrorMessage(null);
    
    // Simulate connection process
    setTimeout(() => {
      try {
        // Update device status
        const connectedDevice = { 
          ...device, 
          status: 'connected' as const,
          lastSeen: new Date()
        };
        
        setSelectedDevice(connectedDevice);
        setConnectionStatus('connected');
        
        // Call the onConnect callback with the connected device
        onConnect(connectedDevice);
      } catch (error) {
        setConnectionStatus('error');
        setErrorMessage('Failed to establish a secure connection. Please try again.');
        console.error('Connection error:', error);
      }
    }, 2000);
  };

  // Disconnect from the device
  const disconnectDevice = () => {
    if (selectedDevice) {
      // Simulate disconnection process
      setTimeout(() => {
        setSelectedDevice(null);
        setConnectionStatus('idle');
        onDisconnect();
      }, 1000);
    }
  };

  // Device connection component UI
  return (
    <div className="device-connector">
      {showStatus && (
        <div className="connection-status">
          <div className={`status-indicator ${connectionStatus}`}></div>
          <span className="status-text">
            {connectionStatus === 'idle' && !selectedDevice && 'Ready to connect'}
            {connectionStatus === 'scanning' && 'Scanning for devices...'}
            {connectionStatus === 'connecting' && 'Establishing connection...'}
            {connectionStatus === 'connected' && `Connected to ${selectedDevice?.name}`}
            {connectionStatus === 'error' && 'Connection error'}
          </span>
        </div>
      )}
      
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      
      {!selectedDevice ? (
        <div className="device-discovery">
          <button 
            className="scan-button"
            onClick={scanForDevices}
            disabled={scanning}
          >
            {scanning ? 'Scanning...' : 'Scan for Devices'}
          </button>
          
          {availableDevices.length > 0 && (
            <div className="device-list">
              <h3>Available Devices</h3>
              <ul>
                {availableDevices.map(device => (
                  <li key={device.id} className="device-item">
                    <div className="device-info">
                      <strong>{device.name}</strong>
                      <span className="device-model">{device.model}</span>
                      <span className="device-os">{device.osVersion}</span>
                    </div>
                    <button 
                      className="connect-button"
                      onClick={() => connectToDevice(device)}
                      disabled={connectionStatus === 'connecting'}
                    >
                      Connect
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="connected-device">
          <div className="device-details">
            <h3>{selectedDevice.name}</h3>
            <div className="device-specs">
              <div><strong>Model:</strong> {selectedDevice.model}</div>
              <div><strong>OS:</strong> {selectedDevice.osVersion}</div>
              {selectedDevice.batteryLevel !== undefined && (
                <div><strong>Battery:</strong> {selectedDevice.batteryLevel}%</div>
              )}
              <div><strong>Connection:</strong> {selectedDevice.connectionType.toUpperCase()}</div>
              <div><strong>Status:</strong> {selectedDevice.status === 'connected' ? 'Active' : 'Disconnected'}</div>
            </div>
          </div>
          <div className="device-actions">
            <button 
              className="disconnect-button"
              onClick={disconnectDevice}
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceConnector;