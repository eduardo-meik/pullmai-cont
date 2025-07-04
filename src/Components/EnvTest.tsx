import React from 'react'

const EnvTest: React.FC = () => {
  const envVars = {
    VITE_API_KEY: import.meta.env.VITE_API_KEY,
    VITE_AUTH_DOMAIN: import.meta.env.VITE_AUTH_DOMAIN,
    VITE_PROJECT_ID: import.meta.env.VITE_PROJECT_ID,
    VITE_STORAGE_BUCKET: import.meta.env.VITE_STORAGE_BUCKET,
    VITE_MESSAGING_SENDER_ID: import.meta.env.VITE_MESSAGING_SENDER_ID,
    VITE_APP_ID: import.meta.env.VITE_APP_ID,
  }

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">Environment Variables Test</h2>
      <div className="space-y-2">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="flex items-center space-x-2">
            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{key}:</span>
            <span className={value ? 'text-green-600' : 'text-red-600'}>
              {value ? '✅ Set' : '❌ Missing'}
            </span>
            {value && (
              <span className="text-xs text-gray-500">
                ({value.substring(0, 20)}...)
              </span>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 border rounded">
        <h3 className="font-bold text-yellow-800">Debug Info:</h3>
        <p className="text-sm text-yellow-700">
          If variables show as missing, check the .env file and restart the dev server.
        </p>
        <pre className="text-xs mt-2 text-yellow-600">
          Expected location: {window.location.origin}/.env
        </pre>
      </div>
    </div>
  )
}

export default EnvTest
