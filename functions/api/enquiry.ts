/**
 * Cloudflare Pages Functions endpoint for SAAR Lead Delivery.
 * Target Route: POST /api/enquiry
 *
 * Cloudflare Pages automatically discovers this file inside the functions/ directory.
 * Runtime: Cloudflare Workers Edge runtime.
 */

import type { EnquiryServerEnv } from '../../src/types/enquiry';
import { handleEnquiryRequest } from '../../src/lib/server/enquiry-handler';

interface EventContext<Env, P extends string, Data> {
  request: Request;
  env: Env;
  params: Record<P, string | string[]>;
  data: Data;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  waitUntil: (promise: Promise<unknown>) => void;
}

type PagesFunction<Env = unknown, P extends string = string, Data = Record<string, unknown>> = (
  context: EventContext<Env, P, Data>
) => Response | Promise<Response>;

export const onRequestPost: PagesFunction<EnquiryServerEnv> = async (context) => {
  return handleEnquiryRequest(context.request, context.env);
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
