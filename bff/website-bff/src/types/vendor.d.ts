declare module 'cookie-parser' {
  function cookieParser(): (req: unknown, res: unknown, next: () => void) => void;

  export default cookieParser;
}

declare module 'express' {
  export interface Request {
    path: string;
    cookies?: Record<string, string | undefined>;
  }

  export interface Response {
    cookie(name: string, value: string, options?: Record<string, unknown>): this;
    clearCookie(name: string, options?: Record<string, unknown>): this;
  }

  export type NextFunction = () => void;
}
