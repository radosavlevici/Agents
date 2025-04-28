import { useState, useEffect } from 'react';
import { DeviceOperation, DeviceCommand } from '../lib/realWorldOperations';
import { realWorldOps } from '../lib/realWorldOperations';

interface DeviceOperationsProps {
  deviceId: string;
  maxOperations?: number;
  onOperationComplete?: (operation: DeviceOperation) => void;
}

const DeviceOperations: React.FC<DeviceOperationsProps> = ({ 
  deviceId,
  maxOperations = 5,
  onOperationComplete
}) => {
  const [operations, setOperations] = useState<DeviceOperation[]>([]);
  const [activeOperationId, setActiveOperationId] = useState<string | null>(null);
  const [expandedOperations, setExpandedOperations] = useState<Set<string>>(new Set());

  // Load device operations
  useEffect(() => {
    const loadOperations = () => {
      const deviceOperations = realWorldOps.getDeviceOperations(deviceId);
      setOperations(deviceOperations);
      
      // Set active operation if there is one
      const inProgressOp = deviceOperations.find(op => op.status === 'in-progress');
      if (inProgressOp) {
        setActiveOperationId(inProgressOp.id);
      }
    };
    
    // Initial load
    loadOperations();
    
    // Set up interval to refresh operations
    const interval = setInterval(loadOperations, 2000);
    
    return () => {
      clearInterval(interval);
    };
  }, [deviceId]);

  // Subscribe to active operation updates
  useEffect(() => {
    if (!activeOperationId) {
      return;
    }
    
    const handleOperationUpdate = (operation: DeviceOperation) => {
      setOperations(prevOperations => {
        // Find and update the operation
        const updatedOperations = prevOperations.map(op => 
          op.id === operation.id ? operation : op
        );
        
        // Check if the operation is complete
        if (operation.status === 'completed' || operation.status === 'failed' || operation.status === 'cancelled') {
          setActiveOperationId(null);
          
          // Call the onOperationComplete callback if provided
          if (onOperationComplete) {
            onOperationComplete(operation);
          }
        }
        
        return updatedOperations;
      });
    };
    
    // Subscribe to operation updates
    realWorldOps.onOperationUpdate(activeOperationId, handleOperationUpdate);
    
    return () => {
      realWorldOps.offOperationUpdate(activeOperationId, handleOperationUpdate);
    };
  }, [activeOperationId, onOperationComplete]);

  // Execute a new operation
  const executeOperation = (operationType: string, target: string) => {
    try {
      const operationId = realWorldOps.executeOperation(deviceId, operationType, target);
      setActiveOperationId(operationId);
      
      // Expand the new operation
      setExpandedOperations(prev => {
        const newSet = new Set(prev);
        newSet.add(operationId);
        return newSet;
      });
      
      // Refresh operations
      const deviceOperations = realWorldOps.getDeviceOperations(deviceId);
      setOperations(deviceOperations);
    } catch (error) {
      console.error('Failed to execute operation:', error);
    }
  };

  // Cancel an operation
  const cancelOperation = (operationId: string) => {
    realWorldOps.cancelOperation(operationId);
  };

  // Toggle operation details expansion
  const toggleOperationExpansion = (operationId: string) => {
    setExpandedOperations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(operationId)) {
        newSet.delete(operationId);
      } else {
        newSet.add(operationId);
      }
      return newSet;
    });
  };

  // Get status color class
  const getStatusColorClass = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'status-success';
      case 'failed':
        return 'status-error';
      case 'cancelled':
        return 'status-warning';
      case 'in-progress':
        return 'status-active';
      default:
        return 'status-pending';
    }
  };

  // Format date/time
  const formatDateTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString();
  };

  // Calculate operation duration
  const calculateDuration = (startTime: Date, endTime?: Date): string => {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    const durationMs = end - start;
    
    if (durationMs < 1000) {
      return `${durationMs}ms`;
    } else if (durationMs < 60000) {
      return `${Math.floor(durationMs / 1000)}s`;
    } else {
      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    }
  };

  // Render command
  const renderCommand = (command: DeviceCommand): JSX.Element => {
    return (
      <div key={command.id} className={`operation-command ${getStatusColorClass(command.status)}`}>
        <div className="command-header">
          <div className="command-type">{command.type.toUpperCase()}</div>
          <div className="command-target">{command.target}</div>
          <div className="command-status">{command.status}</div>
        </div>
        
        {command.progress !== undefined && (
          <div className="command-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${command.progress}%` }}
              ></div>
            </div>
            <div className="progress-text">{Math.round(command.progress)}%</div>
          </div>
        )}
        
        {command.startTime && (
          <div className="command-timing">
            <span>Started: {formatDateTime(command.startTime)}</span>
            {command.endTime && (
              <>
                <span>Completed: {formatDateTime(command.endTime)}</span>
                <span>Duration: {calculateDuration(command.startTime, command.endTime)}</span>
              </>
            )}
          </div>
        )}
        
        {command.result && (
          <div className="command-result">
            <div className="result-header">Result:</div>
            <pre className="result-data">{JSON.stringify(command.result, null, 2)}</pre>
          </div>
        )}
        
        {command.error && (
          <div className="command-error">
            <div className="error-header">Error:</div>
            <div className="error-message">{command.error}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="device-operations">
      <div className="operations-header">
        <h3>Device Operations</h3>
        
        {!activeOperationId && (
          <div className="operation-actions">
            <button
              className="operation-button"
              onClick={() => executeOperation('scan', 'system')}
              disabled={!!activeOperationId}
            >
              System Scan
            </button>
            <button
              className="operation-button"
              onClick={() => executeOperation('scan', 'security')}
              disabled={!!activeOperationId}
            >
              Security Scan
            </button>
            <button
              className="operation-button"
              onClick={() => executeOperation('optimize', 'performance')}
              disabled={!!activeOperationId}
            >
              Optimize Performance
            </button>
          </div>
        )}
      </div>
      
      {operations.length === 0 ? (
        <div className="no-operations">No operations found for this device.</div>
      ) : (
        <div className="operations-list">
          {operations.slice(0, maxOperations).map(operation => (
            <div 
              key={operation.id}
              className={`operation-item ${getStatusColorClass(operation.status)}`}
            >
              <div 
                className="operation-header"
                onClick={() => toggleOperationExpansion(operation.id)}
              >
                <div className="operation-info">
                  <div className="operation-type">
                    {operation.commands[0]?.type.toUpperCase()} - {operation.commands[0]?.target}
                  </div>
                  <div className="operation-status">{operation.status.toUpperCase()}</div>
                </div>
                
                <div className="operation-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${operation.progress}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">{operation.progress}%</div>
                </div>
                
                <div className="operation-timing">
                  <span>Started: {formatDateTime(operation.startTime)}</span>
                  {operation.endTime && (
                    <span>Duration: {calculateDuration(operation.startTime, operation.endTime)}</span>
                  )}
                </div>
                
                <div className="operation-actions">
                  {operation.status === 'in-progress' && (
                    <button
                      className="cancel-button"
                      onClick={e => {
                        e.stopPropagation();
                        cancelOperation(operation.id);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                  <span className="expand-indicator">
                    {expandedOperations.has(operation.id) ? '▼' : '▶'}
                  </span>
                </div>
              </div>
              
              {expandedOperations.has(operation.id) && (
                <div className="operation-details">
                  <div className="operation-commands">
                    {operation.commands.map(command => renderCommand(command))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeviceOperations;