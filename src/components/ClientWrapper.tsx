"use client";

import React, { useEffect } from 'react';

interface ClientWrapperProps {
  children: React.ReactNode;
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
  useEffect(() => {
    console.log('ClientWrapper mounted - child components should render now');
  }, []);

  return (
    <div className="client-wrapper">
      {children}
    </div>
  );
};

export default ClientWrapper;
