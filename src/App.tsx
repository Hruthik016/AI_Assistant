import React from 'react';
import { NhostProvider } from '@nhost/react';
import { ApolloProvider } from '@apollo/client';
import { nhost } from './config/nhost';
import { apolloClient } from './config/apollo';
import AuthGuard from './components/AuthGuard';
import { ChatApp } from './components/ChatApp';

function App() {
  return (
    <NhostProvider nhost={nhost}>
      <ApolloProvider client={apolloClient}>
        <AuthGuard>
          <ChatApp />
        </AuthGuard>
      </ApolloProvider>
    </NhostProvider>
  );
}

export default App;