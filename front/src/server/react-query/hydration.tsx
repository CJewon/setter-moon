import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

const serverQueryDefaults = {
  queries: {
    staleTime: 30_000
  }
};

export function createServerQueryClient() {
  return new QueryClient({
    defaultOptions: serverQueryDefaults
  });
}

type ServerQueryHydrationBoundaryProps = {
  children: React.ReactNode;
  queryClient: QueryClient;
};

export function ServerQueryHydrationBoundary({ children, queryClient }: ServerQueryHydrationBoundaryProps) {
  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
