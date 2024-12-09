// Sidebar.js
import React from 'react';
import { Search, Bell, HelpCircle, Settings } from 'lucide-react'; // アイコンを導入

const Sidebar = () => {
  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800">タフホールディングス</h2>
      </div>
      <nav className="mt-4">
        <a href="#" className="block px-4 py-2 text-sm text-blue-600 bg-blue-50 font-medium">レントロール</a>
        <a href="#" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">預託金等</a>
        <a href="#" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">水道費明細</a>
        <a href="#" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">月額家賃入金明細</a>
        <a href="#" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">月額家賃入金履歴</a>
      </nav>
    </div>
  );
};

export default Sidebar;

