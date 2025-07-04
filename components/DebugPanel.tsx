'use client';

import React from 'react';

const DebugPanel = () => {
  const [logs, setLogs] = React.useState<string[]>([]);
  
  React.useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      originalLog(...args);
      setLogs(prev => [...prev.slice(-10), `LOG: ${args.join(' ')}`]);
    };
    
    console.error = (...args) => {
      originalError(...args);
      setLogs(prev => [...prev.slice(-10), `ERROR: ${args.join(' ')}`]);
    };
    
    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 w-96 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-h-60 overflow-y-auto z-50">
      <div className="font-bold mb-2">Debug Console</div>
      {logs.map((log, index) => (
        <div key={index} className={`mb-1 ${log.startsWith('ERROR') ? 'text-red-300' : 'text-green-300'}`}>
          {log}
        </div>
      ))}
      {logs.length === 0 && (
        <div className="text-gray-400">Nenhum log ainda...</div>
      )}
    </div>
  );
};

export default DebugPanel;
