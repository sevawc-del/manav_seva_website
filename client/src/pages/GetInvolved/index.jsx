import React from 'react';
import { Outlet } from 'react-router-dom';

const GetInvolved = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Get Involved</h1>
      <Outlet />
    </div>
  );
};

export default GetInvolved;
