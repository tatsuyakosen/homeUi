import React from 'react';
import { Bell, HelpCircle, Settings, ChevronDown, Home } from 'lucide-react'; // アイコンを追加
import { Link } from 'react-router-dom'; // Link をインポート

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* 左側 - ホームアイコン */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg">
            <Home className="h-5 w-5" />
          </Link>
        </div>

        {/* 右側 - その他のアイコン */}
        <div className="flex items-center space-x-4">
          <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg">
            <Bell className="h-5 w-5" />
          </button>
          <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg">
            <HelpCircle className="h-5 w-5" />
          </button>
          <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg">
            <Settings className="h-5 w-5" />
          </button>
          
        </div>
      </div>
    </header>
  );
};

export default Header;
