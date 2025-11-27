import { createTRPCReact } from '@trpc/react-query';
import { AppRouter } from '@workspace/server/trpc/router';

export const trpc: ReturnType<typeof createTRPCReact<AppRouter>> = createTRPCReact<AppRouter>();

export default trpc;