import React from 'react';
import SkeletonGrid from './SkeletonGrid.jsx';

export default function LoadingSection() {
  return (
    <div style={{ padding: '18px 0' }}>
      <SkeletonGrid count={8} />
    </div>
  );
}

