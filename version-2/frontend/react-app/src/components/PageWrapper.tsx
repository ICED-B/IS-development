import { ReactNode } from 'react';

export default function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-120px)] px-4 py-8">
      <div className="w-full max-w-4xl">{children}</div>
    </div>
  );
}
