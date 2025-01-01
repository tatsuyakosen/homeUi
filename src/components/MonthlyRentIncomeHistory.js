import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MonthlyRentIncomeHistory = () => {
  const { propertyId } = useParams();

  // 現在年月
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // ユーザーが選んだ年・月 (タブUI)
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // rentRoll + history
  const [rentRollData, setRentRollData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [error, setError] = useState(null);

  // 入力編集管理
  const [editing, setEditing] = useState({});
  const [mode, setMode] = useState("view"); // "view" | "create" | "edit"

  // ---------- 1) fetch RentRoll & History ----------
  const fetchRentRollData = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/properties/${propertyId}/rentroll`);
      if (!res.ok) throw new Error(`RentRoll取得失敗: ${res.status}`);
      const data = await res.json();
      setRentRollData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchHistoryData = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/properties/${propertyId}/monthly-rent-income-history`);
      if (!res.ok) throw new Error(`History取得失敗: ${res.status}`);
      const data = await res.json();
      setHistoryData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (propertyId) {
      setError(null);
      Promise.all([fetchRentRollData(), fetchHistoryData()])
        .catch(e => setError(e.message));
    }
  }, [propertyId]);

  // ---------- 2) Month / Year UI ----------
  const handleMonthClick = (m) => {
    setSelectedMonth(m);
    // モードをviewに戻す
    setMode("view");
    setEditing({});
  };

  // ---------- 3) 6か月分の配列 ----------
  const computeMonthsArray = () => {
    let result = [];
    const baseDate = new Date(selectedYear, selectedMonth - 1, 1);
    // 過去5か月～当月(計6)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setMonth(d.getMonth() - i);
      result.push({ 
        year: d.getFullYear(), 
        month: d.getMonth() + 1 
      });
    }
    return result;
  };
  const monthsToShow = computeMonthsArray();

  // ---------- 4) rentRollをcreatedAtでフィルタ ----------
  const filteredRentRollData = rentRollData.filter(rr => {
    if (!rr.createdAt) return false;
    const y = parseInt(rr.createdAt.slice(0, 4), 10);
    const m = parseInt(rr.createdAt.slice(5, 7), 10);
    return (y === selectedYear && m === selectedMonth);
  });

  // ---------- 5) historyDataをマージ ----------
  const mergedData = filteredRentRollData.map(rr => {
    const hist = historyData.find(h => h.rentRollId === rr.id);
    return {
      rentRollId: rr.id,
      floor: rr.floor,
      roomNumber: rr.roomNumber,
      roomUsage: rr.roomUsage,
      contractor: rr.contractor,
      pastDifferenceTotal: hist ? hist.pastDifferenceTotal : 0,
      months: hist ? hist.months : [],
      cumulativeDifference: hist ? hist.cumulativeDifference : 0
    };
  });

  // ---------- 6) 入力変更 (当月の差額のみ編集可) ----------
  const handleChange = (rentRollId, year, month, field, value) => {
    if (mode === "view") return;

    // 当月チェック
    const isCurrentMonth = (year === currentYear && month === currentMonth);
    if (!isCurrentMonth) {
      // 過去月は編集不可
      return;
    }

    // 差額のみ編集可
    if (field !== "differenceAmount") {
      return;
    }

    setEditing(prev => {
      const copy = { ...prev };
      const key = `${year}-${month}`;
      if (!copy[rentRollId]) copy[rentRollId] = {};
      if (!copy[rentRollId][key]) copy[rentRollId][key] = {};
      copy[rentRollId][key][field] = value;
      return copy;
    });
  };

  // ---------- 7) 保存 (当月差額のみ、入金額は既存値を使用) ----------
  const handleSave = (rentRollId, year, month, incomeVal) => {
    if (mode === "view") return;
    // 当月以外は保存しない
    if (!(year === currentYear && month === currentMonth)) {
      return;
    }
    const key = `${year}-${month}`;
    const editObj = editing[rentRollId]?.[key];
    if (!editObj) return;

    const diffAmount = parseFloat(editObj.differenceAmount || 0);
    // 既存の入金額(incomeVal)をそのまま送る
    const finalIncomeAmount = parseFloat(incomeVal || 0);

    fetch(`http://localhost:8080/api/properties/${propertyId}/monthly-rent-income-history/update?rentRollId=${rentRollId}&year=${year}&month=${month}&incomeAmount=${finalIncomeAmount}&differenceAmount=${diffAmount}`, {
      method: 'POST'
    })
    .then(res => res.ok ? res.text() : Promise.reject(res))
    .then(msg => {
      console.log("更新:", msg);
      // 更新後再取得
      fetchHistoryData();
      setEditing({});
      setMode("view");
    })
    .catch(e => setError("更新失敗"));
  };

  // 新規登録 & 変更ボタン
  const handleCreateClick = () => setMode("create");
  const handleEditClick = () => setMode("edit");

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  // 年選択＋月ボタン
  const yearSelect = (
    <div className="mb-2">
      <select
        value={selectedYear}
        onChange={e => setSelectedYear(parseInt(e.target.value, 10))}
        className="border rounded p-1 mr-2"
      >
        <option value={2022}>2022年</option>
        <option value={2023}>2023年</option>
        <option value={2024}>2024年</option>
        <option value={2025}>2025年</option>
      </select>
      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
        <button
          key={m}
          onClick={() => handleMonthClick(m)}
          className={`px-3 py-1 rounded mr-1 ${
            selectedMonth === m ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
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
          {/* ヘッダー部分 */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              月額家賃入金履歴 (選択: {selectedYear}年 {selectedMonth}月 + 過去5か月)
            </h3>
            <div>
              <button
                onClick={handleCreateClick}
                className="px-3 py-1 bg-blue-500 text-white rounded mr-2"
              >
                新規登録
              </button>
              <button
                onClick={handleEditClick}
                className="px-3 py-1 bg-green-500 text-white rounded"
              >
                変更
              </button>
            </div>
          </div>

          {yearSelect}

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-green-100">
                <tr>
                  <th className="border px-4 py-2">階</th>
                  <th className="border px-4 py-2">No.</th>
                  <th className="border px-4 py-2">用途</th>
                  <th className="border px-4 py-2">契約者</th>
                  <th className="border px-4 py-2">過去差額累計</th>
                  {monthsToShow.map((m, i) => (
                    <th key={i} className="border px-4 py-2 text-center" colSpan={2}>
                      {m.year}年{m.month}月
                    </th>
                  ))}
                  <th className="border px-4 py-2">差額累計</th>
                </tr>
                <tr>
                  <th className="border px-4 py-2"></th>
                  <th className="border px-4 py-2"></th>
                  <th className="border px-4 py-2"></th>
                  <th className="border px-4 py-2"></th>
                  <th className="border px-4 py-2"></th>
                  {monthsToShow.map((m, i) => (
                    <React.Fragment key={i}>
                      <th className="border px-4 py-2">入金額</th>
                      <th className="border px-4 py-2">差額</th>
                    </React.Fragment>
                  ))}
                  <th className="border px-4 py-2"></th>
                </tr>
              </thead>

              <tbody>
                {mergedData.length === 0 ? (
                  <tr>
                    <td colSpan={5 + monthsToShow.length * 2 + 1} className="border px-4 py-2 text-center">
                      該当データがありません。
                    </td>
                  </tr>
                ) : (
                  mergedData.map((row) => (
                    <tr key={row.rentRollId}>
                      <td className="border px-4 py-2">{row.floor}</td>
                      <td className="border px-4 py-2">{row.roomNumber}</td>
                      <td className="border px-4 py-2">{row.roomUsage}</td>
                      <td className="border px-4 py-2">{row.contractor}</td>
                      <td className="border px-4 py-2">{row.pastDifferenceTotal}</td>

                      {monthsToShow.map((mInfo, idx2) => {
                        const key = `${mInfo.year}-${mInfo.month}`;
                        // DB上の既存データ
                        const found = row.months.find(mm => mm.year===mInfo.year && mm.month===mInfo.month);
                        const incomeVal = found ? found.incomeAmount : 0; // ここが既存の入金額
                        const diffVal = found ? found.differenceAmount : 0;

                        // 当月判定
                        const isCurrentMonth = (mInfo.year === currentYear && mInfo.month === currentMonth);

                        // editing中のステート
                        const editObj = editing[row.rentRollId]?.[key] || {};
                        const valToShow = (editObj.differenceAmount !== undefined)
                          ? editObj.differenceAmount
                          : diffVal;

                        return (
                          <React.Fragment key={idx2}>
                            {/* 入金額(常に表示のみ) */}
                            <td className="border px-4 py-2">{incomeVal}</td>

                            {/* 差額(当月のみ mode!="view" で編集可) */}
                            <td className="border px-4 py-2">
                              {isCurrentMonth && mode!=="view" ? (
                                <>
                                  <input
                                    type="number"
                                    defaultValue={diffVal}
                                    onChange={(e) =>
                                      handleChange(row.rentRollId, mInfo.year, mInfo.month, "differenceAmount", e.target.value)
                                    }
                                    className="w-full border"
                                  />
                                  <button
                                    onClick={() => handleSave(row.rentRollId, mInfo.year, mInfo.month, incomeVal)}
                                    // ↑ 第4引数で "既存の入金額" を渡す
                                    className="ml-2 text-blue-500 hover:underline"
                                  >
                                    保存
                                  </button>
                                </>
                              ) : (
                                <span>{diffVal}</span>
                              )}
                            </td>
                          </React.Fragment>
                        );
                      })}
                      <td className="border px-4 py-2">{row.cumulativeDifference}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyRentIncomeHistory;
