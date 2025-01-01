import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const UncollectedAdvancePayment = () => {
  const { propertyId } = useParams();

  const [rentRollData, setRentRollData] = useState([]);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newData, setNewData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // RentRollデータ取得（データを返すように修正）
  const fetchRentRollData = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/properties/${propertyId}/rentroll`);
      if (!res.ok) throw new Error(`RentRoll取得失敗: ${res.status}`);
      const data = await res.json();
      setRentRollData(data);
      return data; // データを返す
    } catch (err) {
      setError(err.message);
      return []; // エラー時は空配列を返す
    }
  };

  // 未収金データ取得（データを受け取るように修正）
  const fetchPayments = async (rentRollDataParam) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/properties/${propertyId}/uncollected-advance-payments?year=${selectedYear}&month=${selectedMonth}`
      );
      if (!res.ok) throw new Error(`未収金データ取得失敗: ${res.status}`);
      const data = await res.json();

      // RentRollデータが未ロードの場合はエラー
      if (rentRollDataParam.length === 0) {
        throw new Error('RentRollデータが存在しません。');
      }

      // RentRollデータを統合
      const enrichedPayments = data.map((payment) => {
        const rentRoll = rentRollDataParam.find((rr) => rr.id === payment.rentRollId);

        return {
          ...payment,
          floor: rentRoll?.floor || '未登録',
          roomNumber: rentRoll?.roomNumber || '未登録',
          roomUsage: rentRoll?.roomUsage || '未登録',
        };
      });

      setPayments(enrichedPayments);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // データをロード（fetchRentRollDataからデータを取得し、fetchPaymentsに渡す）
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const rentRoll = await fetchRentRollData(); // RentRollデータを取得
        await fetchPayments(rentRoll); // RentRollデータを渡してPaymentsを取得
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [propertyId, selectedYear, selectedMonth]);

  // 以下は既存のコードと同様...

  // モーダルを開く
  const handleModalOpen = () => {
    setNewData({
      roomNumber: '',
      details: '',
      guaranteeCompany: '',
      notes: '',
      contactInfo: '',
      preDifference: 0,
      depositAdjustment: 0,
      postMoveInPayment: 0,
      uncollectible: 0,
    });
    setIsModalOpen(true);
  };

  // モーダルを閉じる
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // モーダルのフィールド変更
  const handleModalChange = (field, value) => {
    setNewData((prev) => ({ ...prev, [field]: value }));
  };

  // 新規作成を保存
  const handleModalSave = async () => {
    try {
      const rentRoll = rentRollData.find((item) => item.roomNumber === newData.roomNumber);
      if (!rentRoll) {
        alert('選択した部屋番号が無効です。');
        return;
      }

      const saveData = {
        ...newData,
        rentRollId: rentRoll.id,
        year: selectedYear,
        month: selectedMonth,
      };

      const res = await fetch(
        `http://localhost:8080/api/properties/${propertyId}/uncollected-advance-payments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saveData),
        }
      );
      if (!res.ok) throw new Error(`新規登録失敗: ${res.status}`);
      alert('新規登録成功！');

      await fetchPayments(rentRollData); // 再フェッチ時もrentRollDataを渡す

      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // プルダウン用の部屋番号を抽出
  const extractUniqueRoomNumbers = () => {
    const uniqueRoomNumbers = [...new Set(rentRollData.map((rr) => rr.roomNumber))];
    return uniqueRoomNumbers;
  };

  const yearSelect = (
    <div className="mb-4">
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
        className="border rounded p-1"
      >
        <option value={2022}>2022年</option>
        <option value={2023}>2023年</option>
        <option value={2024}>2024年</option>
        <option value={2025}>2025年</option>
      </select>
    </div>
  );

  const monthTabs = (
    <div className="flex space-x-2 mb-4">
      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
        <button
          key={month}
          onClick={() => setSelectedMonth(month)}
          className={`px-3 py-1 rounded ${
            selectedMonth === month ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
          }`}
        >
          {month}月
        </button>
      ))}
    </div>
  );

  if (isLoading) {
    return <div className="text-center">データを読み込み中...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header propertyId={propertyId} />
      <div className="flex flex-1">
        <Sidebar propertyId={propertyId} />
        <div className="flex-1 p-4 bg-white rounded-lg shadow relative">
          <h3 className="text-lg font-semibold mb-4">未収金前受金</h3>
          {error && <div className="text-red-500">{error}</div>}

          {yearSelect}
          {monthTabs}

          <button
            onClick={handleModalOpen}
            className="mb-4 px-3 py-1 bg-green-500 text-white rounded"
          >
            新規作成
          </button>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-green-100">
                <tr>
                  <th className="border px-4 py-2">階</th>
                  <th className="border px-4 py-2">No.</th>
                  <th className="border px-4 py-2">用途</th>
                  <th className="border px-4 py-2">未収金詳細</th>
                  <th className="border px-4 py-2">家賃保証会社</th>
                  <th className="border px-4 py-2">備考</th>
                  <th className="border px-4 py-2">連絡先</th>
                  <th className="border px-4 py-2">処理前差額</th>
                  <th className="border px-4 py-2">敷金充当</th>
                  <th className="border px-4 py-2">退去後入金</th>
                  <th className="border px-4 py-2">回収不能</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="border px-4 py-2">{payment.floor}</td>
                    <td className="border px-4 py-2">{payment.roomNumber}</td>
                    <td className="border px-4 py-2">{payment.roomUsage}</td>
                    <td className="border px-4 py-2">{payment.details}</td>
                    <td className="border px-4 py-2">{payment.guaranteeCompany}</td>
                    <td className="border px-4 py-2">{payment.notes}</td>
                    <td className="border px-4 py-2">{payment.contactInfo}</td>
                    <td className="border px-4 py-2">{payment.preDifference}</td>
                    <td className="border px-4 py-2">{payment.depositAdjustment}</td>
                    <td className="border px-4 py-2">{payment.postMoveInPayment}</td>
                    <td className="border px-4 py-2">{payment.uncollectible}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded shadow-lg">
                <h3 className="text-lg font-semibold mb-4">新規作成</h3>

                <div className="mb-4">
                  <label className="block mb-1">部屋番号</label>
                  <select
                    value={newData.roomNumber || ''}
                    onChange={(e) => handleModalChange('roomNumber', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="">選択してください</option>
                    {extractUniqueRoomNumbers().map((roomNumber, idx) => (
                      <option key={idx} value={roomNumber}>
                        {roomNumber}
                      </option>
                    ))}
                  </select>
                </div>

                {[ // フォームフィールドを生成
                  { field: 'details', label: '未収金詳細' },
                  { field: 'guaranteeCompany', label: '家賃保証会社' },
                  { field: 'notes', label: '備考' },
                  { field: 'contactInfo', label: '連絡先' },
                  { field: 'preDifference', label: '処理前差額' },
                  { field: 'depositAdjustment', label: '敷金充当' },
                  { field: 'postMoveInPayment', label: '退去後入金' },
                  { field: 'uncollectible', label: '回収不能' },
                ].map((item, idx) => (
                  <div className="mb-4" key={idx}>
                    <label className="block mb-1">{item.label}</label>
                    <input
                      type={['preDifference', 'depositAdjustment', 'postMoveInPayment', 'uncollectible'].includes(
                        item.field
                      )
                        ? 'number'
                        : 'text'}
                      value={newData[item.field] || ''}
                      onChange={(e) => handleModalChange(item.field, e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>
                ))}

                <div className="flex justify-end">
                  <button
                    onClick={handleModalClose}
                    className="px-3 py-1 bg-gray-500 text-white rounded mr-2"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleModalSave}
                    className="px-3 py-1 bg-green-500 text-white rounded"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UncollectedAdvancePayment;
