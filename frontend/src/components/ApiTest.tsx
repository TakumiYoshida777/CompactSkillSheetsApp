import { errorLog } from '../utils/logger';
import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const ApiTest = () => {
  const [healthStatus, setHealthStatus] = useState<{ status: string; timestamp?: string } | null>(null);
  const [apiInfo, setApiInfo] = useState<{ name?: string; version?: string; description?: string } | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testHealthEndpoint = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8000/health');
      setHealthStatus(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Health check failed: ${errorMessage}`);
      errorLog('Health check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testApiEndpoint = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(API_URL);
      setApiInfo(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`API info failed: ${errorMessage}`);
      errorLog('API info error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testCORS = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      const data = await response.json();
      setHealthStatus(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`CORS test failed: ${errorMessage}`);
      errorLog('CORS test error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>API疎通確認テスト</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>テスト実行</h3>
        <button 
          onClick={testHealthEndpoint} 
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px' }}
        >
          Health Check
        </button>
        <button 
          onClick={testApiEndpoint} 
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px' }}
        >
          API Info
        </button>
        <button 
          onClick={testCORS} 
          disabled={loading}
          style={{ padding: '10px' }}
        >
          CORS Test
        </button>
      </div>

      {loading && <p>Loading...</p>}
      
      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          <h3>エラー</h3>
          <pre>{error}</pre>
        </div>
      )}

      {healthStatus && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Health Status</h3>
          <pre style={{ background: '#f4f4f4', padding: '10px', color: 'black' }}>
            {JSON.stringify(healthStatus, null, 2)}
          </pre>
        </div>
      )}

      {apiInfo && (
        <div style={{ marginBottom: '20px' }}>
          <h3>API Information</h3>
          <pre style={{ background: '#f4f4f4', padding: '10px', color: 'black' }}>
            {JSON.stringify(apiInfo, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3>環境変数</h3>
        <p>VITE_API_URL: {import.meta.env.VITE_API_URL || 'Not set'}</p>
        <p>Using API URL: {API_URL}</p>
      </div>
    </div>
  );
};