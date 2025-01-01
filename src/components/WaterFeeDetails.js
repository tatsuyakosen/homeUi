import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const WaterFeeDetails = () => {
  const { propertyId } = useParams();

  const [rentRollData, setRentRollData] = useState([]);
  const [waterFeeData, setWaterFeeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(""); 
  const [currentReading, setCurrentReading] = useState("");

  // 現在の年と月を初期値に
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const fetchRentRollData = async () => {
    try {
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
      } else {
        const errorData = await response.json();
        setError(
          `レントロールデータの取得に失敗しました: ${errorData.message || ""}`
        );
      }
    } catch (err) {
      setError("データの取得中にエラーが発生しました: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWaterFeeData = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/properties/${propertyId}/water-fees`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setWaterFeeData(data);
      } else {
        const errorData = await response.json();
        setError(
          `水道費データの取得に失敗しました: ${errorData.message || ""}`
        );
      }
    } catch (err) {
      setError("データの取得中にエラーが発生しました: " + err.message);
    }
  };

  useEffect(() => {
    if (propertyId) {
      fetchRentRollData().then(() => {
        fetchWaterFeeData();
      });
    }
  }, [propertyId]);

  const handleSaveNewReading = async () => {
    const roomId = parseInt(selectedRoomId, 10);
    const selectedRoom = rentRollData.find((room) => room.id === roomId);
    if (!selectedRoom) {
      alert("部屋を選択してください。");
      return;
    }

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const createdAt = `${yyyy}/${mm}/${dd}`;

    const newEntry = {
      rentRollId: selectedRoom.id,
      previousReading: 0,
      currentReading: parseFloat(currentReading) || 0,
      createdAt: createdAt
    };

    try {
      const response = await fetch(
        `http://localhost:8080/api/properties/${propertyId}/water-fees`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEntry),
        }
      );

      if (response.ok) {
        const savedData = await response.json();
        setWaterFeeData((prevData) => [...prevData, savedData]);
        setSelectedRoomId("");
        setCurrentReading("");
        setShowModal(false);
      } else {
        const errorData = await response.json();
        alert(`保存に失敗しました: ${errorData.message || ""}`);
      }
    } catch (error) {
      alert("保存中にエラーが発生しました: " + error.message);
    }
  };

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

  // RentRollのcreatedAtでフィルタリング
  const filteredRentRollData = rentRollData.filter((item) => {
    if (!item.createdAt) return false;
    const yearStr = item.createdAt.slice(0, 4);
    const monthStr = item.createdAt.slice(5, 7);
    const itemYear = parseInt(yearStr, 10);
    const itemMonth = parseInt(monthStr, 10);

    return itemYear === selectedYear && itemMonth === selectedMonth;
  });

  // filteredRentRollDataをベースに、対応するwaterFeeDataをマージ
  const mergedData = filteredRentRollData.map((room) => {
    const fee = waterFeeData.find((feeItem) => feeItem.rentRollId === room.id);
    const usage = fee ? (fee.currentReading - (fee.previousReading || 0)) : 0;
    const waterBill = usage * 1200;

    return {
      id: room.id,
      floor: room.floor,
      roomNumber: room.roomNumber,
      roomUsage: room.roomUsage,
      contractor: room.contractor,
      contractDate: room.contractDate,
      previousReading: fee ? fee.previousReading : 0,
      currentReading: fee ? fee.currentReading : 0,
      usage: usage,
      waterBill: waterBill
    };
  });

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
            selectedMonth === month ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
          }`}
        >
          {month}月
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
          <h3 className="text-lg font-semibold mb-4">{propertyId} の水道費明細</h3>

          {yearSelect}
          {monthTabs}

          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              新規作成
            </button>
          </div>
          <div className="overflow-x-auto mt-8">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2">階</th>
                  <th className="px-4 py-2">No.</th>
                  <th className="px-4 py-2">用途</th>
                  <th className="px-4 py-2">契約者</th>
                  <th className="px-4 py-2">原契約日</th>
                  <th className="px-4 py-2">前回検針</th>
                  <th className="px-4 py-2">今回検針</th>
                  <th className="px-4 py-2">使用量(㎡)</th>
                  <th className="px-4 py-2">水道料</th>
                </tr>
              </thead>
              <tbody>
                {mergedData.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="border px-4 py-2 text-center">
                      選択した年・月のデータがありません。
                    </td>
                  </tr>
                ) : (
                  mergedData.map((item) => (
                    <tr key={item.id}>
                      <td className="border px-4 py-2">{item.floor}</td>
                      <td className="border px-4 py-2">{item.roomNumber}</td>
                      <td className="border px-4 py-2">{item.roomUsage}</td>
                      <td className="border px-4 py-2">{item.contractor}</td>
                      <td className="border px-4 py-2">{item.contractDate}</td>
                      <td className="border px-4 py-2">{item.previousReading}</td>
                      <td className="border px-4 py-2">{item.currentReading}</td>
                      <td className="border px-4 py-2">{item.usage}</td>
                      <td className="border px-4 py-2">{item.waterBill}</td>
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
            <h2 className="text-xl mb-4">新規検針登録</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveNewReading();
              }}
            >
              <div className="mb-4">
                <label className="block text-sm mb-1">部屋を選択</label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full border p-2 rounded"
                  required
                >
                  <option value="">部屋を選択してください</option>
                  {rentRollData.map((room) => (
                    <option key={room.id} value={room.id}>
                      {`${room.floor}階 No.${room.roomNumber} ${room.roomUsage} ${room.contractor}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">今回検針</label>
                <input
                  type="number"
                  value={currentReading}
                  onChange={(e) => setCurrentReading(e.target.value)}
                  className="w-full border p-2 rounded"
                  required
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
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaterFeeDetails;
