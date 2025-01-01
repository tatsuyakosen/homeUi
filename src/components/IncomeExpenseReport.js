import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * 収支報告書コンポーネント
 * 
 * - 分類コード100, 140 の合計 (total) を表示
 * - 分類コード200 の本体金額 (amount) と消費税 (tax) を表示
 * - (6)-(1), (6)-(2), (6)-(3) 分配金も省略せず全部
 */
const IncomeExpenseReport = () => {
  const { propertyId } = useParams();

  // === 1) 年・月・日 切り替え用ステート ===
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [days, setDays] = useState([]);

  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  // === 2) summary (分類コードごとの合計値など) ===
  const [summary, setSummary] = useState(null);

  // === 3) 「内容」を編集するモーダル ===
  const [showModal, setShowModal] = useState(false);
  const [modalField, setModalField] = useState('');
  const [modalValue, setModalValue] = useState('');

  // エラー表示用
  const [error, setError] = useState(null);

  // -------------------------
  // ダミー: 年リスト取得
  // -------------------------
  const fetchYears = async () => {
    try {
      // 本来はバックエンドから取得
      setYears([2022, 2023, 2024]);
    } catch (err) {
      setError(err.message);
    }
  };

  // -------------------------
  // ダミー: 月リスト取得
  // -------------------------
  const fetchMonths = async (year) => {
    try {
      // 本来はバックエンドから取得
      setMonths([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    } catch (err) {
      setError(err.message);
    }
  };

  // -------------------------
  // ダミー: 日リスト取得
  // -------------------------
  const fetchDays = async (year, month) => {
    try {
      // 本来はバックエンドから取得
      setDays([1, 5, 10, 15, 20, 25, 30]);
    } catch (err) {
      setError(err.message);
    }
  };

  // -------------------------
  // 分類コード=100 の合計 (total)
  // -------------------------
  const fetchCode100Sum = async (year, month, day) => {
    const params = [];
    if (year) params.push(`year=${year}`);
    if (month) params.push(`month=${month}`);
    if (day) params.push(`day=${day}`);
    const qs = params.length > 0 ? `?${params.join('&')}` : '';

    const url = `http://localhost:8080/api/properties/${propertyId}/income-expense/code100sum${qs}`;
    const response = await fetch(url);
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText);
    }
    const sumValue = await response.json(); 
    return sumValue;
  };

  // -------------------------
  // 分類コード=140 の合計 (total)
  // -------------------------
  const fetchCode140Sum = async (year, month, day) => {
    const params = [];
    if (year) params.push(`year=${year}`);
    if (month) params.push(`month=${month}`);
    if (day) params.push(`day=${day}`);
    const qs = params.length > 0 ? `?${params.join('&')}` : '';

    const url = `http://localhost:8080/api/properties/${propertyId}/income-expense/code140sum${qs}`;
    const response = await fetch(url);
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText);
    }
    const sumValue = await response.json();
    return sumValue;
  };

  // -------------------------
  // 分類コード=200 の本体金額 (amount) 合計
  // -------------------------
  const fetchCode200AmountSum = async (year, month, day) => {
    const params = [];
    if (year) params.push(`year=${year}`);
    if (month) params.push(`month=${month}`);
    if (day) params.push(`day=${day}`);
    const qs = params.length > 0 ? `?${params.join('&')}` : '';

    const url = `http://localhost:8080/api/properties/${propertyId}/income-expense/code200amountsum${qs}`;
    const response = await fetch(url);
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText);
    }
    const sumValue = await response.json();
    return sumValue;
  };

  // -------------------------
  // 分類コード=200 の消費税 (tax) 合計
  // -------------------------
  const fetchCode200TaxSum = async (year, month, day) => {
    const params = [];
    if (year) params.push(`year=${year}`);
    if (month) params.push(`month=${month}`);
    if (day) params.push(`day=${day}`);
    const qs = params.length > 0 ? `?${params.join('&')}` : '';

    const url = `http://localhost:8080/api/properties/${propertyId}/income-expense/code200taxsum${qs}`;
    const response = await fetch(url);
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText);
    }
    const sumValue = await response.json();
    return sumValue;
  };

  // -------------------------
  // サマリをまとめて取得
  // -------------------------
  const fetchSummary = async (year, month, day) => {
    try {
      // 家賃収入(100)
      const houseRentSum = await fetchCode100Sum(year, month, day);

      // その他収入(140)
      const otherIncomeSum = await fetchCode140Sum(year, month, day);

      // 建物管理費(200) - 本体金額
      const manageBodyAmount = await fetchCode200AmountSum(year, month, day);

      // 建物管理費(200) - 消費税
      const manageTaxSum = await fetchCode200TaxSum(year, month, day);

      // ダミーを交えつつ合計をセット
      const newSummary = {
        houseRentTotal: houseRentSum,
        otherIncomeTotal: otherIncomeSum,

        manageAmount: manageBodyAmount,
        manageTax: manageTaxSum,
        manageTotal: manageBodyAmount + manageTaxSum, // 仮の計算例

        utilityAmount: 230613,
        utilityTax: 23059,
        utilityTotal: 253672,
        repairAmount: 0,
        repairTax: 0,
        repairTotal: 0,
        tenantAmount: 0,
        tenantTax: 0,
        tenantTotal: 0,
        otherAmount: 231408,
        otherTax: 23141,
        otherTotal: 254549,

        difference: 1423051,
        totalAdvance: 1016157,
        netIncome: 406894,
      };
      setSummary(newSummary);
    } catch (err) {
      setError(err.message);
    }
  };

  // ---- 初期ロード ----
  useEffect(() => {
    if (propertyId) {
      fetchYears();
      fetchSummary(null, null, null);
    }
  }, [propertyId]);

  // 年変更時
  useEffect(() => {
    if (selectedYear) {
      fetchMonths(selectedYear);
      setSelectedMonth(null);
      setSelectedDay(null);
      fetchSummary(selectedYear, null, null);
    } else {
      setMonths([]);
      setDays([]);
      setSelectedMonth(null);
      setSelectedDay(null);
      fetchSummary(null, null, null);
    }
  }, [selectedYear]);

  // 月変更時
  useEffect(() => {
    if (selectedMonth != null) {
      fetchDays(selectedYear, selectedMonth);
      setSelectedDay(null);
      fetchSummary(selectedYear, selectedMonth, null);
    } else {
      setDays([]);
      setSelectedDay(null);
      fetchSummary(selectedYear, null, null);
    }
  }, [selectedMonth]);

  // 日変更時
  useEffect(() => {
    if (selectedDay != null) {
      fetchSummary(selectedYear, selectedMonth, selectedDay);
    } else if (selectedMonth != null) {
      fetchSummary(selectedYear, selectedMonth, null);
    } else {
      fetchSummary(selectedYear, null, null);
    }
  }, [selectedDay]);

  // ---- モーダル関連 ----
  const openModal = (fieldKey) => {
    setModalField(fieldKey);
    setModalValue('');
    setShowModal(true);
  };

  const handleModalSave = () => {
    console.log(`保存: field=${modalField}, value=${modalValue}`);
    setShowModal(false);
  };

  const s = summary || {};

  return (
    <div className="flex flex-col h-screen">
      <Header propertyId={propertyId} />
      <div className="flex flex-1">
        <Sidebar propertyId={propertyId} />

        <div className="flex-1 p-4 bg-gray-100 overflow-auto">
          {/* 年・月・日 選択 UI */}
          <div className="mb-4 flex space-x-4 items-center flex-wrap">
            <div>
              <label>年を選択:</label>
              <select
                className="border ml-2 p-1"
                value={selectedYear || ''}
                onChange={(e) =>
                  setSelectedYear(e.target.value ? parseInt(e.target.value) : null)
                }
              >
                <option value="">すべて</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            {selectedYear && (
              <div>
                <label>月を選択:</label>
                {months.map((m) => (
                  <button
                    key={m}
                    className={`ml-2 px-2 py-1 ${
                      selectedMonth === m ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    } rounded`}
                    onClick={() => setSelectedMonth(m)}
                  >
                    {m}月
                  </button>
                ))}
                <button
                  className={`ml-2 px-2 py-1 ${
                    selectedMonth == null ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  } rounded`}
                  onClick={() => setSelectedMonth(null)}
                >
                  全部
                </button>
              </div>
            )}
            {selectedMonth != null && days.length > 0 && (
              <div>
                <label>日を選択:</label>
                {days.map((d) => (
                  <button
                    key={d}
                    className={`ml-2 px-2 py-1 ${
                      selectedDay === d ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    } rounded`}
                    onClick={() => setSelectedDay(d)}
                  >
                    {d}日
                  </button>
                ))}
                <button
                  className={`ml-2 px-2 py-1 ${
                    selectedDay == null ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  } rounded`}
                  onClick={() => setSelectedDay(null)}
                >
                  全部
                </button>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-6">収支報告書</h1>
          {error && <div className="text-red-500 mb-2">{error}</div>}

          {/* (1) 収入 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">(1) 収入</h2>
            <table className="min-w-full table-auto border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">分類コード</th>
                  <th className="border border-gray-300 px-4 py-2">科目</th>
                  <th className="border border-gray-300 px-4 py-2">本体金額</th>
                  <th className="border border-gray-300 px-4 py-2">消費税</th>
                  <th className="border border-gray-300 px-4 py-2">総額</th>
                  <th className="border border-gray-300 px-4 py-2">内容</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {/* 100 */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2">100</td>
                  <td className="border border-gray-300 px-4 py-2">家賃収入</td>
                  <td className="border border-gray-300 px-4 py-2">-</td>
                  <td className="border border-gray-300 px-4 py-2">-</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {s.houseRentTotal ?? 0}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      className="text-blue-500 underline"
                      onClick={() => openModal('incomeMemo')}
                    >
                      編集
                    </button>
                  </td>
                </tr>
                {/* 140 */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2">140</td>
                  <td className="border border-gray-300 px-4 py-2">その他収入</td>
                  <td className="border border-gray-300 px-4 py-2">-</td>
                  <td className="border border-gray-300 px-4 py-2">-</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {s.otherIncomeTotal ?? 0}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      className="text-blue-500 underline"
                      onClick={() => openModal('otherIncomeMemo')}
                    >
                      編集
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* (2) 支出 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">(2) 支出</h2>
            <table className="min-w-full table-auto border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">分類コード</th>
                  <th className="border border-gray-300 px-4 py-2">科目</th>
                  <th className="border border-gray-300 px-4 py-2">本体金額</th>
                  <th className="border border-gray-300 px-4 py-2">消費税</th>
                  <th className="border border-gray-300 px-4 py-2">総額</th>
                  <th className="border border-gray-300 px-4 py-2">内容</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {/* 200: 建物管理費 */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2">200</td>
                  <td className="border border-gray-300 px-4 py-2">建物管理費</td>
                  {/* 本体金額 → manageAmount */}
                  <td className="border border-gray-300 px-4 py-2">
                    {s.manageAmount ?? 0}
                  </td>
                  {/* 消費税 → manageTax */}
                  <td className="border border-gray-300 px-4 py-2">
                    {s.manageTax ?? 0}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{s.manageTotal ?? 0}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      className="text-blue-500 underline"
                      onClick={() => openModal('manageMemo')}
                    >
                      編集
                    </button>
                  </td>
                </tr>
                {/* 210, 220, 240, 270 (ダミー) */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2">210</td>
                  <td className="border border-gray-300 px-4 py-2">水道光熱通信費</td>
                  <td className="border border-gray-300 px-4 py-2">{s.utilityAmount ?? 0}</td>
                  <td className="border border-gray-300 px-4 py-2">{s.utilityTax ?? 0}</td>
                  <td className="border border-gray-300 px-4 py-2">{s.utilityTotal ?? 0}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      className="text-blue-500 underline"
                      onClick={() => openModal('utilityMemo')}
                    >
                      編集
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">220</td>
                  <td className="border border-gray-300 px-4 py-2">修繕費</td>
                  <td className="border border-gray-300 px-4 py-2">{s.repairAmount ?? 0}</td>
                  <td className="border border-gray-300 px-4 py-2">{s.repairTax ?? 0}</td>
                  <td className="border border-gray-300 px-4 py-2">{s.repairTotal ?? 0}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      className="text-blue-500 underline"
                      onClick={() => openModal('repairMemo')}
                    >
                      編集
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">240</td>
                  <td className="border border-gray-300 px-4 py-2">テナント募集費用</td>
                  <td className="border border-gray-300 px-4 py-2">{s.tenantAmount ?? 0}</td>
                  <td className="border border-gray-300 px-4 py-2">{s.tenantTax ?? 0}</td>
                  <td className="border border-gray-300 px-4 py-2">{s.tenantTotal ?? 0}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      className="text-blue-500 underline"
                      onClick={() => openModal('tenantMemo')}
                    >
                      編集
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">270</td>
                  <td className="border border-gray-300 px-4 py-2">その他費用</td>
                  <td className="border border-gray-300 px-4 py-2">{s.otherAmount ?? 0}</td>
                  <td className="border border-gray-300 px-4 py-2">{s.otherTax ?? 0}</td>
                  <td className="border border-gray-300 px-4 py-2">{s.otherTotal ?? 0}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      className="text-blue-500 underline"
                      onClick={() => openModal('otherMemo')}
                    >
                      編集
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* (3) 収支 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">(3) 収支</h2>
            <p className="text-sm mb-2">
              賃料等は右記の口座にて確認しております。<br />
              ＝ (1) 収入 - (2) 支出 = <strong>{s.difference ?? '(計算結果)'}</strong>
            </p>
          </section>

          {/* (4) 立替金 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">(4) 立替金</h2>
            <table className="min-w-full table-auto border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">分類コード</th>
                  <th className="border border-gray-300 px-4 py-2">科目</th>
                  <th className="border border-gray-300 px-4 py-2">本体金額</th>
                  <th className="border border-gray-300 px-4 py-2">消費税</th>
                  <th className="border border-gray-300 px-4 py-2">総額</th>
                  <th className="border border-gray-300 px-4 py-2">内容</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">-</td>
                  <td className="border border-gray-300 px-4 py-2">元利金の返済額</td>
                  <td className="border border-gray-300 px-4 py-2">0</td>
                  <td className="border border-gray-300 px-4 py-2">0</td>
                  <td className="border border-gray-300 px-4 py-2">798,374</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      className="text-blue-500 underline"
                      onClick={() => openModal('mortgageMemo')}
                    >
                      編集
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">-</td>
                  <td className="border border-gray-300 px-4 py-2">固定資産税・都市計画税</td>
                  <td className="border border-gray-300 px-4 py-2">0</td>
                  <td className="border border-gray-300 px-4 py-2">0</td>
                  <td className="border border-gray-300 px-4 py-2">167,783</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      className="text-blue-500 underline"
                      onClick={() => openModal('propertyTaxMemo')}
                    >
                      編集
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">-</td>
                  <td className="border border-gray-300 px-4 py-2">積立金</td>
                  <td className="border border-gray-300 px-4 py-2">0</td>
                  <td className="border border-gray-300 px-4 py-2">0</td>
                  <td className="border border-gray-300 px-4 py-2">50,000</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      className="text-blue-500 underline"
                      onClick={() => openModal('depositMemo')}
                    >
                      編集
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* (5) 純収益 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">(5) 純収益</h2>
            <p className="text-sm mb-2">
              = (3) 収支 - (4) 立替金 = {s.netIncome ?? '(計算結果)'}
            </p>
          </section>

          {/* 賃料管理口座 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">賃料管理口座</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-300 bg-white p-3 shadow">
                <p className="text-sm mb-2">
                  賃料等は右記の口座にて確認しております。
                </p>
              </div>
              <div className="border border-gray-300 bg-white p-3 shadow">
                <table className="min-w-full table-auto border border-gray-300 text-sm">
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">銀行名</td>
                      <td className="border border-gray-300 px-4 py-1">
                        三井住友銀行
                        <button
                          onClick={() => openModal('rentAccountBank')}
                          className="ml-2 text-blue-500 underline"
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">支店名</td>
                      <td className="border border-gray-300 px-4 py-1">
                        備後町支店
                        <button
                          onClick={() => openModal('rentAccountBranch')}
                          className="ml-2 text-blue-500 underline"
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">預金種類</td>
                      <td className="border border-gray-300 px-4 py-1">
                        普通
                        <button
                          onClick={() => openModal('rentAccountType')}
                          className="ml-2 text-blue-500 underline"
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">口座番号</td>
                      <td className="border border-gray-300 px-4 py-1">
                        1864439
                        <button
                          onClick={() => openModal('rentAccountNumber')}
                          className="ml-2 text-blue-500 underline"
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">名義人</td>
                      <td className="border border-gray-300 px-4 py-1">
                        株式会社TAFFホールディングス
                        <button
                          onClick={() => openModal('rentAccountHolder')}
                          className="ml-2 text-blue-500 underline"
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* (6) 分配金 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3">(6) 分配金</h2>

            {/* (6)-(1) */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-300 bg-white p-3 shadow">
                <h3 className="font-semibold mb-2">(6)-(1) 分配金</h3>
                <table className="min-w-full table-auto border border-gray-300 text-sm">
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">純収益</td>
                      <td className="border border-gray-300 px-4 py-1">406,894</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">配分率</td>
                      <td className="border border-gray-300 px-4 py-1">50%</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">端数処理</td>
                      <td className="border border-gray-300 px-4 py-1">+</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">(4)立替金</td>
                      <td className="border border-gray-300 px-4 py-1">1,016,157</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">合計</td>
                      <td className="border border-gray-300 px-4 py-1">1,219,604</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1" colSpan={2}>
                        当月25日迄に右記の口座にお振込いたします。
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border border-gray-300 bg-white p-3 shadow">
                <h3 className="font-semibold mb-2">お振込先口座</h3>
                <table className="min-w-full table-auto border border-gray-300 text-sm">
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">銀行名</td>
                      <td className="border border-gray-300 px-4 py-1">
                        三井住友銀行
                        <button
                          onClick={() => openModal('dist1Bank')}
                          className="ml-2 text-blue-500 underline"
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">支店名</td>
                      <td className="border border-gray-300 px-4 py-1">
                        備後町支店
                        <button
                          onClick={() => openModal('dist1Branch')}
                          className="ml-2 text-blue-500 underline"
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">預金種類</td>
                      <td className="border border-gray-300 px-4 py-1">普通</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">口座番号</td>
                      <td className="border border-gray-300 px-4 py-1">
                        1864439
                        <button
                          onClick={() => openModal('dist1Number')}
                          className="ml-2 text-blue-500 underline"
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">名義人</td>
                      <td className="border border-gray-300 px-4 py-1">
                        株式会社TAFFホールディングス
                        <button
                          onClick={() => openModal('dist1Holder')}
                          className="ml-2 text-blue-500 underline"
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* (6)-(2) */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-300 bg-white p-3 shadow">
                <h3 className="font-semibold mb-2">(6)-(2) 分配金</h3>
                <table className="min-w-full table-auto border border-gray-300 text-sm">
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">純収益</td>
                      <td className="border border-gray-300 px-4 py-1">406,894</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">配分率</td>
                      <td className="border border-gray-300 px-4 py-1">25%</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">端数処理</td>
                      <td className="border border-gray-300 px-4 py-1">+</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">前月調整</td>
                      <td className="border border-gray-300 px-4 py-1">0</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">合計</td>
                      <td className="border border-gray-300 px-4 py-1">101,724</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1" colSpan={2}>
                        当月25日迄に右記の口座にお振込いたします。
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1 text-red-500" colSpan={2}>
                        ※右記金額は、金銭消費貸借契約に基づく金利分が含まれます。<br />
                        ※借入金1700万、金利1%、毎月14,166円、期間10年
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border border-gray-300 bg-white p-3 shadow">
                <h3 className="font-semibold mb-2">お振込先口座</h3>
                <table className="min-w-full table-auto border border-gray-300 text-sm">
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">銀行名</td>
                      <td className="border border-gray-300 px-4 py-1">
                        大阪厚生信用金庫
                        <button
                          onClick={() => openModal('dist2Bank')}
                          className="ml-2 text-blue-500 underline"
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">支店名</td>
                      <td className="border border-gray-300 px-4 py-1">
                        平野支店
                        <button
                          onClick={() => openModal('dist2Branch')}
                          className="ml-2 text-blue-500 underline"
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">預金種類</td>
                      <td className="border border-gray-300 px-4 py-1">普通</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">口座番号</td>
                      <td className="border border-gray-300 px-4 py-1">
                        0398972
                        <button
                          onClick={() => openModal('dist2Number')}
                          className="ml-2 text-blue-500 underline"
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">名義人</td>
                      <td className="border border-gray-300 px-4 py-1">
                        恒安地所株式会社
                        <button
                          onClick={() => openModal('dist2Holder')}
                          className="ml-2 text-blue-500 underline"
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* (6)-(3) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-300 bg-white p-3 shadow">
                <h3 className="font-semibold mb-2">(6)-(3) 分配金</h3>
                <table className="min-w-full table-auto border border-gray-300 text-sm">
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">純収益</td>
                      <td className="border border-gray-300 px-4 py-1">406,894</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">配分率</td>
                      <td className="border border-gray-300 px-4 py-1">??%</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">端数処理</td>
                      <td className="border border-gray-300 px-4 py-1">-</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">前月調整</td>
                      <td className="border border-gray-300 px-4 py-1">0</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">合計</td>
                      <td className="border border-gray-300 px-4 py-1">101,000</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1" colSpan={2}>
                        当月25日迄に右記の口座にお振込いたします。
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border border-gray-300 bg-white p-3 shadow">
                <h3 className="font-semibold mb-2">お振込先口座</h3>
                <table className="min-w-full table-auto border border-gray-300 text-sm">
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">銀行名</td>
                      <td className="border border-gray-300 px-4 py-1">
                        関西みらい銀行
                        <button
                          onClick={() => openModal('dist3Bank')}
                          className="ml-2 text-blue-500 underline"
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">支店名</td>
                      <td className="border border-gray-300 px-4 py-1">
                        梅田支店
                        <button
                          onClick={() => openModal('dist3Branch')}
                          className="ml-2 text-blue-500 underline"
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">預金種類</td>
                      <td className="border border-gray-300 px-4 py-1">普通</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">口座番号</td>
                      <td className="border border-gray-300 px-4 py-1">
                        1920161
                        <button
                          onClick={() => openModal('dist3Number')}
                          className="ml-2 text-blue-500 underline"
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-1">名義人</td>
                      <td className="border border-gray-300 px-4 py-1">
                        合同会社○○○総合鑑定所
                        <button
                          onClick={() => openModal('dist3Holder')}
                          className="ml-2 text-blue-500 underline"
                        >
                          編集
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-red-500 mt-2">
                  マイナス処理が発生した場合は、翌月において調整します
                </p>
              </div>
            </div>
          </section>

          {/* ==== モーダル (内容編集) ==== */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 w-80 rounded shadow-lg">
                <h2 className="text-lg font-semibold mb-2">
                  内容の編集: {modalField}
                </h2>
                <textarea
                  className="w-full border p-2"
                  rows={3}
                  value={modalValue}
                  onChange={(e) => setModalValue(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                  <button
                    className="px-3 py-1 bg-gray-300 rounded mr-2"
                    onClick={() => setShowModal(false)}
                  >
                    キャンセル
                  </button>
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                    onClick={handleModalSave}
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

export default IncomeExpenseReport;
