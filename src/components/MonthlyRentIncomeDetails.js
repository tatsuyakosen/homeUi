import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "./Sidebar";   // 既存コンポーネント
import Header from "./Header";     // 既存コンポーネント

const MonthlyRentIncomeDetails = () => {
  const { propertyId } = useParams();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [rentRollData, setRentRollData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 登録用モーダル関連
  const [showModal, setShowModal] = useState(false);
  const [selectedRentRollId, setSelectedRentRollId] = useState("");
  const [contractorPaymentDate, setContractorPaymentDate] = useState("");
  const [contractorPaymentAmount, setContractorPaymentAmount] = useState("");
  const [substitutePaymentDate, setSubstitutePaymentDate] = useState("");
  const [substitutePaymentAmount, setSubstitutePaymentAmount] = useState("");
  const [substitutePayer, setSubstitutePayer] = useState("");

  const fetchRentRollData = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/properties/${propertyId}/rentroll`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(`レントロールデータ取得失敗: ${errData.message || ""}`);
      }
      const data = await res.json();
      setRentRollData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchMonthlyRentIncomeData = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/properties/${propertyId}/monthly-rent-income?year=${selectedYear}&month=${selectedMonth}`
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(`月額家賃入金明細データ取得失敗: ${errData.message || ""}`);
      }
      const data = await res.json();
      setIncomeData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (propertyId) {
      setLoading(true);
      Promise.all([fetchRentRollData()])
        .then(() => {
          return fetchMonthlyRentIncomeData();
        })
        .then(() => setLoading(false))
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [propertyId, selectedYear, selectedMonth]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // RentRollをyear/monthでフィルタリング
  const filteredRentRollData = rentRollData.filter((roll) => {
    if (!roll.createdAt) return false;
    const yearStr = roll.createdAt.slice(0, 4);
    const monthStr = roll.createdAt.slice(5, 7);
    const itemYear = parseInt(yearStr, 10);
    const itemMonth = parseInt(monthStr, 10);
    return itemYear === selectedYear && itemMonth === selectedMonth;
  });

  // RentRollとMonthlyRentIncomeをマージ
  const mergedData = filteredRentRollData.map((roll) => {
    const income = incomeData.find((inc) => inc.rentRollId === roll.id);
    return {
      rentRollId: roll.id,
      floor: roll.floor,
      roomNumber: roll.roomNumber,
      roomUsage: roll.roomUsage,
      contractor: roll.contractor,
      // 当月入金(契約者)
      contractorPaymentDate: income ? income.contractorPaymentDate : "",
      contractorPaymentAmount: income ? income.contractorPaymentAmount : "",
      // 当月入金(代位弁済)
      substitutePaymentDate: income ? income.substitutePaymentDate : "",
      substitutePaymentAmount: income ? income.substitutePaymentAmount : "",
      substitutePayer: income ? income.substitutePayer : "",
      // 入金合計計算例（入金合計 = contractor + substitute）
      totalIncome:
        (income ? (income.contractorPaymentAmount || 0) : 0) +
        (income ? (income.substitutePaymentAmount || 0) : 0),
      // 請求額はrent、waterFeeなどがrentRollにあると想定(適宜計算式を変更)
      rentFee: roll.rent,
      utilityFee: roll.maintenanceFee || 0, // 仮でmaintenanceFeeを水光油とする
      difference:
        (roll.rent + (roll.maintenanceFee || 0)) -
        ((income ? income.contractorPaymentAmount || 0 : 0) +
          (income ? income.substitutePaymentAmount || 0 : 0)),
    };
  });

  const handleSaveIncome = async () => {
    if (!selectedRentRollId) {
      alert("部屋(RentRoll)を選択してください。");
      return;
    }

    const newEntry = {
      rentRollId: parseInt(selectedRentRollId, 10),
      year: selectedYear,
      month: selectedMonth,
      contractorPaymentDate: contractorPaymentDate || null,
      contractorPaymentAmount: contractorPaymentAmount
        ? parseFloat(contractorPaymentAmount)
        : null,
      substitutePaymentDate: substitutePaymentDate || null,
      substitutePaymentAmount: substitutePaymentAmount
        ? parseFloat(substitutePaymentAmount)
        : null,
      substitutePayer: substitutePayer || null,
    };

    try {
      const res = await fetch(
        `http://localhost:8080/api/properties/${propertyId}/monthly-rent-income`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEntry),
        }
      );
      if (!res.ok) {
        const errData = await res.json();
        alert(`登録失敗: ${errData.message || ""}`);
        return;
      }
      const saved = await res.json();
      // 登録成功後、再フェッチ
      await fetchMonthlyRentIncomeData();
      setShowModal(false);
      // 入力欄リセット
      setSelectedRentRollId("");
      setContractorPaymentDate("");
      setContractorPaymentAmount("");
      setSubstitutePaymentDate("");
      setSubstitutePaymentAmount("");
      setSubstitutePayer("");
    } catch (error) {
      alert("登録中にエラーが発生しました: " + error.message);
    }
  };

  // 年プルダウン
  const yearSelect = (
    <div className="mb-4">
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
        className="border rounded p-1 mr-2"
      >
        <option value={2022}>2022年</option>
        <option value={2023}>2023年</option>
        <option value={2024}>2024年</option>
        <option value={2025}>2025年</option>
      </select>
      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
        <button
          key={m}
          onClick={() => setSelectedMonth(m)}
          className={`px-3 py-1 rounded mr-2 ${
            selectedMonth === m ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
          }`}
        >
          {m}月
        </button>
      ))}
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header propertyId={propertyId} />
      <div className="flex flex-1">
        <Sidebar propertyId={propertyId} />
        <div className="flex-1 p-4 bg-white rounded-lg shadow relative">
          <h3 className="text-lg font-semibold mb-4">{propertyId} の月額家賃入金明細</h3>

          {yearSelect}

          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              新規登録
            </button>
          </div>
          <div className="overflow-x-auto mt-8">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-green-100">
                <tr>
                  <th className="border px-4 py-2" rowSpan={2}>階</th>
                  <th className="border px-4 py-2" rowSpan={2}>No.</th>
                  <th className="border px-4 py-2" rowSpan={2}>用途</th>
                  <th className="border px-4 py-2" rowSpan={2}>契約者</th>
                  <th className="border px-4 py-2" colSpan={2}>当月入金（契約者）</th>
                  <th className="border px-4 py-2" colSpan={3}>当月入金（代位弁済）</th>
                  <th className="border px-4 py-2" rowSpan={2}>入金合計</th>
                  <th className="border px-4 py-2" colSpan={2}>請求額</th>
                  <th className="border px-4 py-2" rowSpan={2}>差額</th>
                </tr>
                <tr>
                  <th className="border px-4 py-2">入金日</th>
                  <th className="border px-4 py-2">金額</th>
                  <th className="border px-4 py-2">入金日</th>
                  <th className="border px-4 py-2">金額</th>
                  <th className="border px-4 py-2">代位弁済者</th>
                  <th className="border px-4 py-2">賃料</th>
                  <th className="border px-4 py-2">水光油</th>
                </tr>
              </thead>
              <tbody>
                {mergedData.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="border px-4 py-2 text-center">
                      選択した年・月のデータがありません。
                    </td>
                  </tr>
                ) : (
                  mergedData.map((item) => (
                    <tr key={item.rentRollId}>
                      <td className="border px-4 py-2">{item.floor}</td>
                      <td className="border px-4 py-2">{item.roomNumber}</td>
                      <td className="border px-4 py-2">{item.roomUsage}</td>
                      <td className="border px-4 py-2">{item.contractor}</td>
                      <td className="border px-4 py-2">{item.contractorPaymentDate}</td>
                      <td className="border px-4 py-2">{item.contractorPaymentAmount}</td>
                      <td className="border px-4 py-2">{item.substitutePaymentDate}</td>
                      <td className="border px-4 py-2">{item.substitutePaymentAmount}</td>
                      <td className="border px-4 py-2">{item.substitutePayer}</td>
                      <td className="border px-4 py-2">{item.totalIncome}</td>
                      <td className="border px-4 py-2">{item.rentFee}</td>
                      <td className="border px-4 py-2">{item.utilityFee}</td>
                      <td className="border px-4 py-2">{item.difference}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl mb-4">当月入金情報登録</h2>
            <div className="mb-4">
              <label className="block text-sm mb-1">部屋(RentRoll)を選択</label>
              <select
                value={selectedRentRollId}
                onChange={(e) => setSelectedRentRollId(e.target.value)}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">選択してください</option>
                {filteredRentRollData.map((roll) => (
                  <option key={roll.id} value={roll.id}>
                    {`${roll.floor}階 No.${roll.roomNumber} ${roll.roomUsage} ${roll.contractor}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">当月入金(契約者) 入金日</label>
              <input
                type="text"
                placeholder="yyyy/MM/dd"
                value={contractorPaymentDate}
                onChange={(e) => setContractorPaymentDate(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">当月入金(契約者) 金額</label>
              <input
                type="number"
                placeholder="金額"
                value={contractorPaymentAmount}
                onChange={(e) => setContractorPaymentAmount(e.target.value)}
                className="w-full border p-2 rounded"
                step="0.01"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">当月入金(代位弁済) 入金日</label>
              <input
                type="text"
                placeholder="yyyy/MM/dd"
                value={substitutePaymentDate}
                onChange={(e) => setSubstitutePaymentDate(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">当月入金(代位弁済) 金額</label>
              <input
                type="number"
                placeholder="金額"
                value={substitutePaymentAmount}
                onChange={(e) => setSubstitutePaymentAmount(e.target.value)}
                className="w-full border p-2 rounded"
                step="0.01"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">代位弁済者</label>
              <input
                type="text"
                placeholder="例: 保証会社ABC"
                value={substitutePayer}
                onChange={(e) => setSubstitutePayer(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded mr-2"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSaveIncome}
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

export default MonthlyRentIncomeDetails;
