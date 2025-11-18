import type { inferAsyncReturnType } from "@trpc/server";
import type { Context as HonoContext } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

type ResHeaderDto = HonoContext['res']['headers'];

declare module "hono" {
  interface ContextVariableMap {
    session: {
      sessionId: string;
      sessionToken: string;
      staffId: string;
    };
    body: any;
    ip: string;
    userAgent: string;
    setCookie: { set: (name: string, value: string, options: any) => void }
    getCookie: { get: (name: string) => string }
    deleteCookie: { del: (name: string) => string }
  }
}

const getIPHeader = (headers: ResHeaderDto) => {
  return headers.get('x-real-ip') || headers.get('x-forwarded-for') || headers.get('cf-connecting-ip') || headers.get("ip") || '';
}

const getIPInHonoRequest = (c: HonoContext) => {
  const headers = c.req.raw.headers;
  const getClientIP = getIPHeader(headers);
  return getClientIP;
}

const getIPInHonoResponse = (c: HonoContext) => {
  const headers = c.res.headers;
  const getClientIP = getIPHeader(headers);
  return getClientIP;
}

export const handleSetKeyInHono = async (c: HonoContext) => {
  const getClientIP = (getIPInHonoRequest(c) || getIPInHonoResponse(c));

  const userAgent = c.req.header('User-Agent') || '';
  c.set("session", {
    sessionId: '',
    staffId: '',
    sessionToken: ''
  });
  c.set("body", {} as any)
  c.set("ip", getClientIP);
  c.set("userAgent", userAgent);
  c.set("setCookie", {
    set: (name: string, value: string, options?: any) => setCookie(c, name, value, options) as void
  });
  c.set("getCookie", { get: (name: string) => getCookie(c, name) as string });
  c.set("deleteCookie", { del: (name: string) => deleteCookie(c, name) as string });
  return c;
}

// Update your context creation
export const createdTRPCContext = async (c: HonoContext) => {
  const honoContext: HonoContext = await handleSetKeyInHono(c);
  return {
    honoContext
  };
};

export type MyContext = inferAsyncReturnType<typeof createdTRPCContext>;