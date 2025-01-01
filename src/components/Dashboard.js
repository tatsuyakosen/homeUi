import React from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import RentRoll from './RentRoll';

const Dashboard = () => {
  const { propertyId } = useParams();

  if (!propertyId) {
    return <p>物件IDが見つかりません。URLを確認してください。</p>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header propertyId={propertyId} />
      <div className="flex flex-1">
        {/* propertyIdをSidebarに渡す */}
        <Sidebar propertyId={propertyId} />
        <div className="flex-1 p-4">
          <RentRoll propertyId={propertyId} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
