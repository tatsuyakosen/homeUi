import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ propertyId }) => {
  return (
    <div className="w-64 bg-white shadow-md flex flex-col">
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800">タフホールディングス</h2>
      </div>
      <nav className="mt-4 flex-1">
        {/* レントロール */}
        {propertyId ? (
          <Link
            to={`/dashboard/${propertyId}`}
            className="block px-4 py-2 text-sm text-blue-600 bg-blue-50 font-medium"
          >
            レントロール
          </Link>
        ) : (
          <span className="block px-4 py-2 text-sm text-blue-600 bg-blue-50 font-medium">
            レントロール (物件ID不明)
          </span>
        )}

        {/* 預託金等 */}
        {propertyId ? (
          <Link
            to={`/deposit-management/${propertyId}`}
            className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            預託金等
          </Link>
        ) : (
          <span className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            預託金等 (物件ID不明)
          </span>
        )}

        {/* 水道費明細 */}
        {propertyId ? (
          <Link
            to={`/water-bill-details/${propertyId}`}
            className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            水道費明細
          </Link>
        ) : (
          <span className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            水道費明細 (物件ID不明)
          </span>
        )}

        {/* 水道光熱費 */}
        {propertyId ? (
          <Link
            to={`/utility-expenses/${propertyId}`}
            className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            水道光熱費
          </Link>
        ) : (
          <span className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            水道光熱費 (物件ID不明)
          </span>
        )}

        {/* 過去資料 */}
        {propertyId && (
          <Link
            to={`/past-documents/${propertyId}`}
            className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            過去資料
          </Link>
        )}

        {/* 月額家賃入金明細 */}
        {propertyId ? (
          <Link
            to={`/monthly-rent-income/${propertyId}`}
            className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            月額家賃入金明細
          </Link>
        ) : (
          <span className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            月額家賃入金明細 (物件ID不明)
          </span>
        )}

        {/* 月額家賃入金履歴 */}
        {propertyId ? (
          <Link
            to={`/monthly-rent-income-history/${propertyId}`}
            className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            月額家賃入金履歴
          </Link>
        ) : (
          <span className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            月額家賃入金履歴 (物件ID不明)
          </span>
        )}

        {/* 未収金前受金 */}
        {propertyId ? (
          <Link
            to={`/uncollected-advance-payment/${propertyId}`}
            className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            未収金前受金
          </Link>
        ) : (
          <span className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            未収金前受金 (物件ID不明)
          </span>
        )}

        {/* 収入支出明細 */}
        {propertyId ? (
          <Link
            to={`/income-expense-details/${propertyId}`}
            className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            収入支出明細
          </Link>
        ) : (
          <span className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            収入支出明細 (物件ID不明)
          </span>
        )}

        {/* 入力マニュアル */}
        {propertyId ? (
          <Link
            to={`/input-manual/${propertyId}`}
            className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            入力マニュアル
          </Link>
        ) : (
          <span className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            入力マニュアル (物件ID不明)
          </span>
        )}

        {/* 収支報告 (新しく追加) */}
        {propertyId ? (
          <Link
            to={`/income-expense-report/${propertyId}`}
            className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 mt-auto"
          >
            収支報告
          </Link>
        ) : (
          <span className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 mt-auto">
            収支報告 (物件ID不明)
          </span>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
