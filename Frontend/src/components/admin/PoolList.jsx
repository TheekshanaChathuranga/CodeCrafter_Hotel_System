import React from 'react';
import PoolCard from './PoolCard';

const PoolList = ({ pools, loading, onEdit }) => {
  if (pools.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No pools found. Add your first pool to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {pools.map((pool) => (
        <PoolCard key={pool._id} pool={pool} onEdit={onEdit} />
      ))}
    </div>
  );
};

export default PoolList;