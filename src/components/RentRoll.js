import React, { useState, useEffect } from "react";
import RegisterRentRollIcon from "./RegisterRentRollIcon"; // アイコンをインポート

const RentRoll = ({ propertyId }) => {
  const [rentRollData, setRentRollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 現在の年と月を初期値にする
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const fetchRentRollData = async () => {
    try {
      console.log("Fetching data for property ID:", propertyId);

      const response = await fetch(
        `http://localhost:8080/api/properties/${propertyId}/rentroll`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRentRollData(data);
        console.log("Fetched RentRoll data:", data);
      } else {
        const errorData = await response.json();
        setError(
          `レントロールデータの取得に失敗しました: ${errorData.message || ""}`
        );
        console.error("Error fetching RentRoll data:", errorData);
      }
    } catch (error) {
      setError("エラーが発生しました: " + error.message);
      console.error("Network error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewRentRoll = (newRentRoll) => {
    setRentRollData((prevData) => [...prevData, newRentRoll]);
  };

  useEffect(() => {
    if (propertyId) {
      console.log("RentRoll is fetching data for property ID:", propertyId);
      fetchRentRollData();
    } else {
      console.error("Property ID is undefined in RentRoll.");
    }
  }, [propertyId]);

  if (loading) {
    return <p>読み込み中...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  // 年選択用のプルダウン
  // 必要に応じて選択肢を増やしたり、動的に生成したりできます。
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

  // 月選択タブ
  const monthTabs = (
    <div className="flex space-x-2 mb-4">
      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
        <button
          key={month}
          onClick={() => setSelectedMonth(month)}
          className={`px-3 py-1 rounded ${selectedMonth === month ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
        >
          {month}月
        </button>
      ))}
    </div>
  );

  // createdAt をもとにフィルタ
  const filteredData = rentRollData.filter((item) => {
    if (!item.createdAt) return false;
    // createdAtは"yyyy/MM/dd"形式と仮定
    const yearStr = item.createdAt.slice(0, 4);  // yyyy
    const monthStr = item.createdAt.slice(5, 7); // MM
    const itemYear = parseInt(yearStr, 10);
    const itemMonth = parseInt(monthStr, 10);

    return itemYear === selectedYear && itemMonth === selectedMonth;
  });

  return (
    <div className="bg-white rounded-lg shadow p-4 relative">
      <h3 className="text-lg font-semibold mb-4">{propertyId} のレントロール</h3>
      <div className="absolute top-4 right-4">
        <RegisterRentRollIcon
          propertyId={propertyId}
          onNewRentRoll={handleNewRentRoll}
        />
      </div>

      {/* 年選択プルダウン */}
      {yearSelect}

      {/* 月タブ */}
      {monthTabs}

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">階</th>
              <th className="px-4 py-2">No.</th>
              <th className="px-4 py-2">用途</th>
              <th className="px-4 py-2">契約者</th>
              <th className="px-4 py-2">原契約日</th>
              <th className="px-4 py-2">賃貸面積</th>
              <th className="px-4 py-2">賃料</th>
              <th className="px-4 py-2">共益費</th>
              <th className="px-4 py-2">消費税</th>
              <th className="px-4 py-2">共込賃料</th>
              <th className="px-4 py-2">坪単価</th>
              <th className="px-4 py-2">駐車場（税込）</th>
              <th className="px-4 py-2">バイク</th>
              <th className="px-4 py-2">駐輪場</th>
              <th className="px-4 py-2">倉庫</th>
              <th className="px-4 py-2">合計</th>
              <th className="px-4 py-2">駐輪場No.</th>
              <th className="px-4 py-2">更新料（税込）</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="18" className="border px-4 py-2 text-center">
                  選択した年・月のデータがありません。
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id}>
                  <td className="border px-4 py-2">{item.floor}</td>
                  <td className="border px-4 py-2">{item.roomNumber}</td>
                  <td className="border px-4 py-2">{item.roomUsage}</td>
                  <td className="border px-4 py-2">{item.contractor}</td>
                  <td className="border px-4 py-2">{item.contractDate}</td>
                  <td className="border px-4 py-2">{item.rentalArea}</td>
                  <td className="border px-4 py-2">{item.rent}</td>
                  <td className="border px-4 py-2">{item.maintenanceFee}</td>
                  <td className="border px-4 py-2">{item.tax}</td>
                  <td className="border px-4 py-2">{item.totalRent}</td>
                  <td className="border px-4 py-2">{item.unitPrice}</td>
                  <td className="border px-4 py-2">{item.parkingFee}</td>
                  <td className="border px-4 py-2">{item.bikeParkingFee}</td>
                  <td className="border px-4 py-2">{item.bicycleParkingFee}</td>
                  <td className="border px-4 py-2">{item.storageFee}</td>
                  <td className="border px-4 py-2">{item.totalFee}</td>
                  <td className="border px-4 py-2">{item.bicycleParkingNumber}</td>
                  <td className="border px-4 py-2">{item.renewalFee}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RentRoll;
