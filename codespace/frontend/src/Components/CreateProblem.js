import React from 'react';

export default function CreateProblem() {
  const role = localStorage.getItem('role');
  if (role !== 'admin') {
    return <div>Unauthorized</div>;
  }
  return <div>Create Problem page</div>;
}
