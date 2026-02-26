import React from 'react';
import { Loader2 } from 'lucide-react';

const GlobalLoader = ({
  fromDashboard = false
}: {
  fromDashboard?: boolean;
}) => {
  return (
    <div
      className={`flex items-center justify-center  ${fromDashboard ? 'h-[80vh] ' : 'min-h-screen'}`}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default GlobalLoader;
