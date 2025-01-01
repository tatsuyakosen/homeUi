import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * IncomeExpenseDetails コンポーネントは、指定されたプロパティの収入支出データを表示および新規登録するためのコンポーネントです。
 */
const IncomeExpenseDetails = () => {
  const { propertyId } = useParams();
  const [incomeData, setIncomeData] = useState([]); // 収入データ
  const [expenseData, setExpenseData] = useState([]); // 支出データ
  const [error, setError] = useState(null);

  // 年と月のリスト
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);

  // 選択された年と月
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  // 登録用モーダル関連
  const [showModal, setShowModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    created_at: '',
    type: '', // 追加: 収入か支出かを選択するフィールド
    partner: '',
    code: '',
    subject: '',
    amount: '',
    tax: '',
    total: '',
    details: '',
  });

  /**
   * 年のリストを取得する関数
   */
  const fetchYears = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/properties/${propertyId}/income-expense/years`);
      if (!response.ok) throw new Error(`年データ取得失敗: ${response.status}`);
      const result = await response.json();
      setYears(result);
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * 月のリストを取得する関数
   * @param {number} year - 指定された年
   */
  const fetchMonths = async (year) => {
    try {
      const response = await fetch(`http://localhost:8080/api/properties/${propertyId}/income-expense/months?year=${year}`);
      if (!response.ok) throw new Error(`月データ取得失敗: ${response.status}`);
      const result = await response.json();
      setMonths(result);
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * 収入支出データを取得する関数
   * @param {number|null} year - フィルタリングする年（オプション）
   * @param {number|null} month - フィルタリングする月（オプション）
   */
  const fetchData = async (year, month) => {
    try {
      let url = `http://localhost:8080/api/properties/${propertyId}/income-expense`;
      const params = [];
      if (year) params.push(`year=${year}`);
      if (month) params.push(`month=${month}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`データ取得失敗: ${response.status}`);
      const result = await response.json();

      // 収入と支出に分ける
      const income = result.filter(item => item.type === 'INCOME');
      const expense = result.filter(item => item.type === 'EXPENSE');

      setIncomeData(income);
      setExpenseData(expense);
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * 初期データを取得
   */
  useEffect(() => {
    fetchYears();
    fetchData();
  }, [propertyId]);

  /**
   * 年が選択された時に月のリストを取得
   */
  useEffect(() => {
    if (selectedYear) {
      fetchMonths(selectedYear);
      setSelectedMonth(null); // 月をリセット
      fetchData(selectedYear, null); // 年でフィルタリング
    } else {
      setMonths([]);
      fetchData(null, null); // フィルタリング解除
    }
  }, [selectedYear]);

  /**
   * 月が選択された時にデータを再取得
   */
  useEffect(() => {
    if (selectedMonth) {
      fetchData(selectedYear, selectedMonth);
    }
  }, [selectedMonth]);

  /**
   * 新規エントリを保存する関数
   */
  const handleSave = async () => {
    // バリデーション
    if (
      !newEntry.created_at ||
      !newEntry.type || // タイプのバリデーション
      !newEntry.partner ||
      !newEntry.code ||
      !newEntry.subject ||
      !newEntry.amount ||
      !newEntry.tax ||
      !newEntry.total
    ) {
      alert('必須項目をすべて入力してください。');
      return;
    }

    // `created_at` を `YYYY-MM-DDTHH:MM:SS` 形式に変換
    const created_at = `${newEntry.created_at}T00:00:00`; // 時間は任意で設定

    const payload = {
      created_at,
      type: newEntry.type, // タイプを追加
      partner: newEntry.partner,
      code: newEntry.code,
      subject: newEntry.subject,
      amount: parseFloat(newEntry.amount),
      tax: parseFloat(newEntry.tax),
      total: parseFloat(newEntry.total),
      details: newEntry.details,
    };

    console.log('送信ペイロード:', payload); // デバッグ用: ペイロードをコンソールに出力

    try {
      const response = await fetch(`http://localhost:8080/api/properties/${propertyId}/income-expense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(`登録失敗: ${errData}`);
      }

      const saved = await response.json();
      alert('登録に成功しました。');

      // 新しいエントリを対応するデータ配列に追加
      if (saved.type === 'INCOME') {
        setIncomeData((prevData) => [saved, ...prevData]);
      } else if (saved.type === 'EXPENSE') {
        setExpenseData((prevData) => [saved, ...prevData]);
      }

      // モーダルを閉じてフォームをリセット
      setShowModal(false);
      setNewEntry({
        created_at: '',
        type: '', // タイプをリセット
        partner: '',
        code: '',
        subject: '',
        amount: '',
        tax: '',
        total: '',
        details: '',
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header propertyId={propertyId} />
      <div className="flex flex-1">
        <div className="w-64">
          <Sidebar propertyId={propertyId} />
        </div>
        <div className="flex-1 p-4 bg-gray-100 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">収入支出明細</h1>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          {/* 年の選択プルダウン */}
          <div className="mb-4">
            <label className="block text-sm mb-1">年を選択</label>
            <select
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
              className="w-32 border p-2 rounded"
            >
              <option value="">全ての年</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* 月の選択タブ */}
          {selectedYear && (
            <div className="mb-4">
              <label className="block text-sm mb-1">月を選択</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedMonth(null)}
                  className={`px-4 py-2 rounded ${
                    selectedMonth === null ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  全ての月
                </button>
                {months.map((month) => (
                  <button
                    key={month}
                    onClick={() => setSelectedMonth(month)}
                    className={`px-4 py-2 rounded ${
                      selectedMonth === month ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {month}月
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            新規登録
          </button>

          {/* 収入表 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">収入</h2>
            {incomeData.length > 0 ? (
              <table className="min-w-full table-auto border-collapse border border-gray-300">
                <thead className="bg-green-200">
                  <tr>
                    <th className="border px-4 py-2">年月日</th>
                    <th className="border px-4 py-2">相手先</th>
                    <th className="border px-4 py-2">分類コード</th>
                    <th className="border px-4 py-2">科目</th>
                    <th className="border px-4 py-2">本体金額</th>
                    <th className="border px-4 py-2">消費税</th>
                    <th className="border px-4 py-2">総額</th>
                    <th className="border px-4 py-2">内容</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-100">
                      <td className="border px-4 py-2">{new Date(item.created_at).toLocaleDateString('ja-JP')}</td>
                      <td className="border px-4 py-2">{item.partner}</td>
                      <td className="border px-4 py-2">{item.code}</td>
                      <td className="border px-4 py-2">{item.subject}</td>
                      <td className="border px-4 py-2">{item.amount}</td>
                      <td className="border px-4 py-2">{item.tax}</td>
                      <td className="border px-4 py-2">{item.total}</td>
                      <td className="border px-4 py-2">{item.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center">収入データがありません</div>
            )}
          </div>

          {/* 支出表 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">支出</h2>
            {expenseData.length > 0 ? (
              <table className="min-w-full table-auto border-collapse border border-gray-300">
                <thead className="bg-red-200">
                  <tr>
                    <th className="border px-4 py-2">年月日</th>
                    <th className="border px-4 py-2">相手先</th>
                    <th className="border px-4 py-2">分類コード</th>
                    <th className="border px-4 py-2">科目</th>
                    <th className="border px-4 py-2">本体金額</th>
                    <th className="border px-4 py-2">消費税</th>
                    <th className="border px-4 py-2">総額</th>
                    <th className="border px-4 py-2">内容</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-100">
                      <td className="border px-4 py-2">{new Date(item.created_at).toLocaleDateString('ja-JP')}</td>
                      <td className="border px-4 py-2">{item.partner}</td>
                      <td className="border px-4 py-2">{item.code}</td>
                      <td className="border px-4 py-2">{item.subject}</td>
                      <td className="border px-4 py-2">{item.amount}</td>
                      <td className="border px-4 py-2">{item.tax}</td>
                      <td className="border px-4 py-2">{item.total}</td>
                      <td className="border px-4 py-2">{item.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center">支出データがありません</div>
            )}
          </div>
        </div>
      </div>

      {/* 新規登録モーダル */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 max-h-screen overflow-y-auto">
            <h2 className="text-xl mb-4">収入支出情報登録</h2>
            <div className="mb-4">
              <label className="block text-sm mb-1">タイプ</label>
              <select
                value={newEntry.type}
                onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">選択してください</option>
                <option value="INCOME">収入</option>
                <option value="EXPENSE">支出</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">年月日</label>
              <input
                type="date"
                value={newEntry.created_at}
                onChange={(e) => setNewEntry({ ...newEntry, created_at: e.target.value })}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">相手先</label>
              <input
                type="text"
                value={newEntry.partner}
                onChange={(e) => setNewEntry({ ...newEntry, partner: e.target.value })}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">分類コード</label>
              <input
                type="text"
                value={newEntry.code}
                onChange={(e) => setNewEntry({ ...newEntry, code: e.target.value })}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">科目</label>
              <input
                type="text"
                value={newEntry.subject}
                onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">本体金額</label>
              <input
                type="number"
                value={newEntry.amount}
                onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                className="w-full border p-2 rounded"
                step="0.01"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">消費税</label>
              <input
                type="number"
                value={newEntry.tax}
                onChange={(e) => setNewEntry({ ...newEntry, tax: e.target.value })}
                className="w-full border p-2 rounded"
                step="0.01"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">総額</label>
              <input
                type="number"
                value={newEntry.total}
                onChange={(e) => setNewEntry({ ...newEntry, total: e.target.value })}
                className="w-full border p-2 rounded"
                step="0.01"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">内容</label>
              <textarea
                value={newEntry.details}
                onChange={(e) => setNewEntry({ ...newEntry, details: e.target.value })}
                className="w-full border p-2 rounded"
                rows="3"
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded mr-2"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeExpenseDetails;
