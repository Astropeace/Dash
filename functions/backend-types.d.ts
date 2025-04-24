declare module '*/backend/src/api/routes' {
  import { Router } from 'express';
  export const router: Router;
  export function find(method: string, path: string): { 
    handler: (ctx: any) => Promise<any>;
    params: Record<string, string>;
  } | undefined;
}

declare module '*/backend/src/utils/logger' {
  interface Logger {
    info: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
  }
  const logger: Logger;
  export default logger;
}
