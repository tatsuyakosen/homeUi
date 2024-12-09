import React, { useState, useEffect } from "react";
import RegisterRentRollIcon from "./RegisterRentRollIcon"; // アイコンをインポート

const RentRoll = ({ propertyId }) => {
  const [rentRollData, setRentRollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // 新しいレントロールデータを追加する関数
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

  return (
    <div className="bg-white rounded-lg shadow p-4 relative">
      {/* レントロール表 */}
      <h3 className="text-lg font-semibold mb-4">{propertyId} のレントロール</h3>
      <div className="absolute top-4 right-4">
        {/* 新規登録アイコン */}
        <RegisterRentRollIcon
          propertyId={propertyId}
          onNewRentRoll={handleNewRentRoll} // 新規登録時のコールバック
        />
      </div>
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
            {rentRollData.map((item) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RentRoll;
