import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Tafu from './components/Tafu';
import Dashboard from './components/Dashboard';
import PastDocuments from './components/PastDocuments';
import DepositManagement from './components/DepositManagement';
import UtilityExpenses from './components/UtilityExpenses';
import WaterFeeDetails from './components/WaterFeeDetails';
import MonthlyRentIncomeDetails from './components/MonthlyRentIncomeDetails';
import MonthlyRentIncomeHistory from './components/MonthlyRentIncomeHistory';
import UncollectedAdvancePayment from './components/UncollectedAdvancePayment'; // 新規コンポーネントのインポート
import IncomeExpenseDetails from './components/IncomeExpenseDetails'; // 既存のコンポーネントのインポート
import InputManualDetails from './components/InputManualDetails'; // 新規コンポーネントのインポート

// 新規コンポーネントのインポート (収支報告)
import IncomeExpenseReport from './components/IncomeExpenseReport';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Tafu />} />
        {/* 既存のルート */}
        <Route path="/dashboard/:propertyId" element={<Dashboard />} />
        <Route path="/past-documents/:propertyId" element={<PastDocuments />} />
        <Route path="/deposit-management/:propertyId" element={<DepositManagement />} />
        <Route path="/utility-expenses/:propertyId" element={<UtilityExpenses />} />
        <Route path="/water-bill-details/:propertyId" element={<WaterFeeDetails />} />
        <Route path="/monthly-rent-income/:propertyId" element={<MonthlyRentIncomeDetails />} />
        <Route path="/monthly-rent-income-history/:propertyId" element={<MonthlyRentIncomeHistory />} />
        <Route path="/uncollected-advance-payment/:propertyId" element={<UncollectedAdvancePayment />} />
        <Route path="/income-expense-details/:propertyId" element={<IncomeExpenseDetails />} />

        {/* 新規ルート: 入力マニュアル */}
        <Route path="/input-manual/:propertyId" element={<InputManualDetails />} />

        {/* 新規ルート: 収支報告 */}
        <Route path="/income-expense-report/:propertyId" element={<IncomeExpenseReport />} />

        {/* 404 Not Found ページ */}
        <Route path="*" element={<p className="p-4">ページが見つかりません。</p>} />
      </Routes>
    </Router>
  );
};

export default App;
