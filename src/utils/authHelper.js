import { useState, useEffect } from 'react';
import { Key, User, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function AuthDebugHelper() {
  const [authInfo, setAuthInfo] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    // Check both possible token keys
    const token = localStorage.getItem('access') || localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh') || localStorage.getItem('refresh_token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    const tokenKey = localStorage.getItem('access') ? 'access' : 
                     localStorage.getItem('access_token') ? 'access_token' : null;

    setAuthInfo({
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      hasUser: !!user,
      token: token ? `${token.substring(0, 20)}...` : null,
      user: user,
      tokenLength: token?.length || 0,
      tokenKey: tokenKey
    });
  };

  const testApiCall = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setTestResult({
          success: false,
          message: 'No token found in localStorage'
        });
        setTesting(false);
        return;
      }

      console.log('Testing API call with token:', token.substring(0, 20) + '...');

      const response = await fetch('http://127.0.0.1:8000/api/users/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (response.status === 401) {
        setTestResult({
          success: false,
          message: 'Token is expired or invalid (401 Unauthorized)',
          details: 'You need to login again'
        });
      } else if (response.ok) {
        const data = await response.json();
        setTestResult({
          success: true,
          message: 'API call successful!',
          details: `Fetched ${data.length || 0} users`
        });
      } else {
        const errorText = await response.text();
        setTestResult({
          success: false,
          message: `API call failed (${response.status})`,
          details: errorText
        });
      }
    } catch (error) {
      console.error('Test error:', error);
      setTestResult({
        success: false,
        message: 'Network error',
        details: error.message
      });
    } finally {
      setTesting(false);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    checkAuthStatus();
    setTestResult(null);
    alert('Auth data cleared. Please login again.');
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-96 bg-white rounded-lg shadow-2xl border-2 border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-600" />
          Auth Debug Panel
        </h3>
        <button
          onClick={checkAuthStatus}
          className="p-1 hover:bg-gray-100 rounded"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {authInfo && (
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            {authInfo.hasToken ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              Access Token: {authInfo.hasToken ? 'Present' : 'Missing'}
            </span>
          </div>

          {authInfo.hasToken && (
            <div className="text-xs text-gray-600 pl-6 font-mono break-all">
              {authInfo.token}
            </div>
          )}

          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            {authInfo.hasRefreshToken ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              Refresh Token: {authInfo.hasRefreshToken ? 'Present' : 'Missing'}
            </span>
          </div>

          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            {authInfo.hasUser ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              User Data: {authInfo.hasUser ? 'Present' : 'Missing'}
            </span>
          </div>

          {authInfo.user && (
            <div className="text-xs text-gray-600 pl-6 space-y-1">
              <div><strong>Name:</strong> {authInfo.user.name}</div>
              <div><strong>Email:</strong> {authInfo.user.email}</div>
              <div><strong>Level:</strong> {authInfo.user.user_level}</div>
            </div>
          )}
        </div>
      )}

      {testResult && (
        <div className={`p-3 rounded-lg mb-4 ${
          testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start gap-2">
            {testResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className={`text-sm font-semibold ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.message}
              </div>
              {testResult.details && (
                <div className={`text-xs mt-1 ${
                  testResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {testResult.details}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={testApiCall}
          disabled={testing || !authInfo?.hasToken}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {testing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Testing...
            </>
          ) : (
            'Test API Call'
          )}
        </button>
        <button
          onClick={clearAuth}
          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors"
        >
          Clear Auth
        </button>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-800">
            <strong>401 Error?</strong> Your token may be expired. Try logging out and logging back in.
          </div>
        </div>
      </div>
    </div>
  );
}