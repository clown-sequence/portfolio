import { useState, useEffect } from 'react';

export const NotFound = () => {
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className={'min-h-screen flex items-center justify-center transition-colors duration-300 dark:bg-black bg-white'}>
      <div className="text-center px-4">
        <h1 className={'text-9xl font-bold mb-4 transition-colors dark:text-white text-black'}>
          404
        </h1>
        <h2 className={'text-3xl font-semibold mb-6 transition-colors dark:text-gray-300 text-gray-700'}>
          Page Not Found
        </h2>
        <p className={'text-lg mb-8 transition-colors dark:text-gray-400 text-gray-600'}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className={'inline-block px-6 py-3 rounded-lg mb-8 transition-colors dark:bg-white dark:text-black bg-black text-white'}>
          <p className="text-lg">
            Redirecting to home in <span className="font-bold text-2xl">{countdown}</span> seconds
          </p>
        </div>
        <div>
          <button
            onClick={handleGoHome}
            className={'px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 dark:bg-white dark:text-black hover:dark:bg-gray-200 bg-black text-white hover:bg-gray-800'}
          >
            Go Home Now
          </button>
        </div>
      </div>
    </div>
  );
};
