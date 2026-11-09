"use client";

import { useState } from 'react';
import { ConnectionCard } from './ConnectionCard';
import { DetailsPanel } from './DetailsPanel';
import { usePollinationsAuth } from '../../hooks/usePollinationsAuth';

export function BYOPSection() {
  const { isConnected, isLoading, error, connect, disconnect, accessToken, isConfigured } = usePollinationsAuth();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="w-full animate-fade-in">
      <ConnectionCard
        isConnected={isConnected}
        isLoading={isLoading}
        error={error}
        accessToken={accessToken}
        isConfigured={isConfigured}
        onConnect={connect}
        onDisconnect={disconnect}
      />
      <DetailsPanel
        showDetails={showDetails}
        onToggleDetails={() => setShowDetails(!showDetails)}
      />
    </div>
  );
}