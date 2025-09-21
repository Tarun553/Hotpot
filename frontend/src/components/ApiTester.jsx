import React, { useState } from 'react';
import { serverUrl } from '../App';

const ApiTester = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      // Test basic server connection
      const res = await fetch(`${serverUrl}/`, {
        credentials: 'include'
      });
      const text = await res.text();
      setResult(`Server connected: ${text}`);
    } catch (error) {
      setResult(`Server connection failed: ${error.message}`);
    }
    setLoading(false);
  };

  const testAuth = async () => {
    setLoading(true);
    try {
      // Test authentication
      const res = await fetch(`${serverUrl}/api/user/current`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setResult(`Auth successful: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`Auth failed: ${res.status}`);
      }
    } catch (error) {
      setResult(`Auth error: ${error.message}`);
    }
    setLoading(false);
  };

  const testOrders = async () => {
    setLoading(true);
    try {
      // Test orders endpoint
      const res = await fetch(`${serverUrl}/api/orders/user`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setResult(`Orders: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`Orders failed: ${res.status}`);
      }
    } catch (error) {
      setResult(`Orders error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-bold mb-4">API Debug Testing</h3>
      <div className="space-x-2 mb-4">
        <button onClick={testConnection} disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded">
          Test Server
        </button>
        <button onClick={testAuth} disabled={loading} className="px-4 py-2 bg-green-500 text-white rounded">
          Test Auth
        </button>
        <button onClick={testOrders} disabled={loading} className="px-4 py-2 bg-orange-500 text-white rounded">
          Test Orders
        </button>
      </div>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
        {loading ? 'Loading...' : result}
      </pre>
    </div>
  );
};

export default ApiTester;