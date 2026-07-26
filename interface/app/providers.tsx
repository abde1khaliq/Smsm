import { Provider } from "@/components/ui/provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
      <Provider>{children}</Provider>
  );
}