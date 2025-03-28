import React, { useEffect, useState } from 'react';

export function EnvCheck() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  useEffect(() => {
    // Get all environment variables that start with VITE_
    const viteEnvVars = Object.entries(import.meta.env).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);

    setEnvVars(viteEnvVars);
  }, []);

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Environment Variables</h1>
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <pre className="whitespace-pre-wrap break-words">
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}