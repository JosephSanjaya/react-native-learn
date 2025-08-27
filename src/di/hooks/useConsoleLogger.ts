import { useEffect, useState } from 'react';

export const useConsoleLogger = () => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const logListener = (message: string) => {
      setLogs((prevLogs) => [...prevLogs, message]);
    };

    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      logListener(args.join(' '));
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  return { logs };
};