import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * InputManualDetails コンポーネントは、指定されたプロパティの入力マニュアルデータを表示および新規登録するためのコンポーネントです。
 */
const InputManualDetails = () => {
  const { propertyId } = useParams();
  const [inputManualData, setInputManualData] = useState([]);
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
    sheetName: '',
    workProgress: '',
    workContent: '',
    created_at: '',
  });

  /**
   * シート名のオプション
   */
  const sheetNameOptions = [
    '表紙',
    '物件概要',
    'レントロール',
    '水道光熱通信料',
    '預託金等',
    '駐車場契約状況',
    '駐輪場契約状況',
    '水道料明細',
    '月額家賃入金明細',
    '月額家賃入金履歴',
    '未収金前受金',
    '収入支出明細',
    '収支報告',
    'リーシングレポート',
    '管理作業実績表',
    '駐車場契約内容',
    '請求書',
    '水道料金表'
  ];

  /**
   * 作業進捗チェックのオプション
   */
  const workProgressOptions = [
    { value: 'COMPLETED', label: '●' },
    { value: 'IN_PROGRESS', label: '確認中' }
  ];

  /**
   * 年のリストを取得する関数
   */
  const fetchYears = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/properties/${propertyId}/input-manual/years`);
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
      const response = await fetch(`http://localhost:8080/api/properties/${propertyId}/input-manual/months?year=${year}`);
      if (!response.ok) throw new Error(`月データ取得失敗: ${response.status}`);
      const result = await response.json();
      setMonths(result);
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * 入力マニュアルデータを取得する関数
   * @param {number|null} year - フィルタリングする年（オプション）
   * @param {number|null} month - フィルタリングする月（オプション）
   */
  const fetchData = async (year, month) => {
    try {
      let url = `http://localhost:8080/api/properties/${propertyId}/input-manual`;
      const params = [];
      if (year) params.push(`year=${year}`);
      if (month) params.push(`month=${month}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`データ取得失敗: ${response.status}`);
      const result = await response.json();

      setInputManualData(result);
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
   * 作業進捗チェックの表示を取得する関数
   * @param {string} progress - 'COMPLETED' または 'IN_PROGRESS'
   * @return {string} 表示用の文字列
   */
  const getWorkProgressDisplay = (progress) => {
    const option = workProgressOptions.find(opt => opt.value === progress);
    return option ? option.label : progress;
  };

  /**
   * 新規エントリを保存する関数
   */
  const handleSave = async () => {
    // バリデーション
    if (
      !newEntry.sheetName ||
      !newEntry.workProgress ||
      !newEntry.workContent ||
      !newEntry.created_at
    ) {
      alert('必須項目をすべて入力してください。');
      return;
    }

    // `created_at` を `YYYY-MM-DDTHH:MM:SS` 形式に変換
    const created_at = `${newEntry.created_at}T00:00:00`; // 時間は任意で設定

    const payload = {
      sheetName: newEntry.sheetName,
      workProgress: newEntry.workProgress,
      workContent: newEntry.workContent,
      created_at,
    };

    console.log('送信ペイロード:', payload); // デバッグ用: ペイロードをコンソールに出力

    try {
      const response = await fetch(`http://localhost:8080/api/properties/${propertyId}/input-manual`, {
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

      // 新しいエントリをデータ配列に追加
      setInputManualData((prevData) => [...prevData, saved]);

      // モーダルを閉じてフォームをリセット
      setShowModal(false);
      setNewEntry({
        sheetName: '',
        workProgress: '',
        workContent: '',
        created_at: '',
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
          <h1 className="text-2xl font-bold mb-4">入力マニュアル</h1>

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

          {/* 入力マニュアル表 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">入力マニュアル一覧</h2>
            {inputManualData.length > 0 ? (
              <table className="min-w-full table-auto border-collapse border border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border px-4 py-2">順番</th>
                    <th className="border px-4 py-2">シート名</th>
                    <th className="border px-4 py-2">作業進捗チェック</th>
                    <th className="border px-4 py-2">作業内容</th>
                  </tr>
                </thead>
                <tbody>
                  {inputManualData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-100">
                      <td className="border px-4 py-2">{item.order}</td>
                      <td className="border px-4 py-2">{item.sheetName}</td>
                      <td className="border px-4 py-2">{getWorkProgressDisplay(item.workProgress)}</td>
                      <td className="border px-4 py-2">{item.workContent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center">入力マニュアルデータがありません</div>
            )}
          </div>
        </div>
      </div>

      {/* 新規登録モーダル */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96 max-h-screen overflow-y-auto">
            <h2 className="text-xl mb-4">入力マニュアル登録</h2>
            <div className="mb-4">
              <label className="block text-sm mb-1">シート名</label>
              <select
                value={newEntry.sheetName}
                onChange={(e) => setNewEntry({ ...newEntry, sheetName: e.target.value })}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">選択してください</option>
                {sheetNameOptions.map((sheet) => (
                  <option key={sheet} value={sheet}>
                    {sheet}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">作業進捗チェック</label>
              <select
                value={newEntry.workProgress}
                onChange={(e) => setNewEntry({ ...newEntry, workProgress: e.target.value })}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">選択してください</option>
                {workProgressOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">作業内容</label>
              <textarea
                value={newEntry.workContent}
                onChange={(e) => setNewEntry({ ...newEntry, workContent: e.target.value })}
                className="w-full border p-2 rounded"
                rows="3"
                required
              ></textarea>
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

export default InputManualDetails;
