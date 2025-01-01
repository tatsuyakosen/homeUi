// src/components/UtilityExpenses.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import RegisterUtilityExpenseIcon from "./RegisterUtilityExpenseIcon"; // 新しい登録アイコンをインポート

const UtilityExpenses = () => {
  const { propertyId } = useParams();

  const [utilityData, setUtilityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contextMenuUtilityId, setContextMenuUtilityId] = useState(null);
  const [editUtilityId, setEditUtilityId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    electricity: "",
    water: "",
    gas: "",
    other1: "",
    other2: "",
  });

  // 年度・月の選択
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // 水道光熱費データの取得
  const fetchUtilityData = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/properties/${propertyId}/utility-expenses`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUtilityData(data);
      } else {
        const errorData = await response.json();
        setError(
          `水道光熱費データの取得に失敗しました: ${errorData.message || ""}`
        );
        console.error("Error fetching utility data:", errorData);
      }
    } catch (error) {
      setError("エラーが発生しました: " + error.message);
      console.error("Network error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId) {
      fetchUtilityData();
    }
  }, [propertyId]);

  const handleNewUtilityExpense = (newUtility) => {
    setUtilityData((prevData) => [...prevData, newUtility]);
  };

  // 水道光熱費削除ハンドラ
  const handleDelete = async () => {
    if (!contextMenuUtilityId) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/properties/${propertyId}/utility-expenses/${contextMenuUtilityId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        console.log("水道光熱費を削除しました。");
        setContextMenuUtilityId(null);
        // 削除後にデータを再取得
        fetchUtilityData();
      } else {
        const errorData = await response.json();
        console.error("水道光熱費削除失敗:", errorData);
        alert(`水道光熱費削除に失敗しました: ${errorData.message || ""}`);
      }
    } catch (error) {
      console.error("水道光熱費削除中にエラーが発生しました:", error);
      alert("水道光熱費削除中にエラーが発生しました。");
    }
  };

  // メニュー表示ハンドラ
  const handleMenuClick = (e, utilityId) => {
    e.preventDefault();
    e.stopPropagation(); // イベント伝播を停止
    setContextMenuUtilityId(utilityId);
  };

  // メニュー外クリックでメニューを閉じる
  const handleOutsideClick = () => {
    if (contextMenuUtilityId) {
      setContextMenuUtilityId(null);
    }
  };

  // 年度選択用のプルダウン
  const yearSelect = (
    <div className="mb-4">
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
        className="border rounded p-2"
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
          className={`px-3 py-1 rounded ${
            selectedMonth === month
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          {month}月
        </button>
      ))}
    </div>
  );

  // フィルタリング
  const filteredData = utilityData.filter((item) => {
    if (!item.createdAt) return false;
    const date = new Date(item.createdAt);
    const itemYear = date.getFullYear();
    const itemMonth = date.getMonth() + 1;

    return itemYear === selectedYear && itemMonth === selectedMonth;
  });

  // 編集モードに入るハンドラ
  const handleEditClick = (utility) => {
    setEditUtilityId(utility.id);
    setEditFormData({
      electricity: utility.electricity,
      water: utility.water,
      gas: utility.gas,
      other1: utility.other1,
      other2: utility.other2,
    });
  };

  // 編集フォームの変更ハンドラ
  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  // 編集フォームの送信ハンドラ
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:8080/api/properties/${propertyId}/utility-expenses/${editUtilityId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            electricity: parseFloat(editFormData.electricity),
            water: parseFloat(editFormData.water),
            gas: parseFloat(editFormData.gas),
            other1: parseFloat(editFormData.other1),
            other2: parseFloat(editFormData.other2),
          }),
        }
      );

      if (response.ok) {
        const updatedUtility = await response.json();
        setUtilityData((prevData) =>
          prevData.map((util) =>
            util.id === updatedUtility.id ? updatedUtility : util
          )
        );
        setEditUtilityId(null);
        alert("水道光熱費を更新しました。");
      } else {
        const errorData = await response.json();
        alert(`水道光熱費の更新に失敗しました: ${errorData.message || ""}`);
      }
    } catch (error) {
      console.error("水道光熱費更新中にエラーが発生しました:", error);
      alert("水道光熱費更新中にエラーが発生しました。");
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

  return (
    <div
      className="h-screen flex flex-col bg-gray-100"
      onClick={handleOutsideClick}
    >
      <Header propertyId={propertyId} />
      <div className="flex flex-1">
        <Sidebar propertyId={propertyId} />

        <div className="flex-1 p-4 bg-white rounded-lg shadow relative">
          <h3 className="text-lg font-semibold mb-4">{propertyId} の水道光熱費</h3>
          <div className="absolute top-4 right-4">
            <RegisterUtilityExpenseIcon
              propertyId={propertyId}
              onNewUtilityExpense={handleNewUtilityExpense}
            />
          </div>

          {/* 年度選択プルダウン */}
          {yearSelect}

          {/* 月選択タブ */}
          {monthTabs}

          {/* 水道光熱費データ表示 */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2" rowSpan="2">階</th>
                  <th className="px-4 py-2" rowSpan="2">No.</th>
                  <th className="px-4 py-2" rowSpan="2">用途</th>
                  <th className="px-4 py-2" rowSpan="2">契約者</th>
                  <th className="px-4 py-2" rowSpan="2">原契約者</th>
                  <th className="px-4 py-2" colSpan="5">水道光熱費</th>
                  <th className="px-4 py-2" rowSpan="2">合計</th>
                  <th className="px-4 py-2" rowSpan="2">操作</th>
                </tr>
                <tr>
                  <th className="px-4 py-2">電気代</th>
                  <th className="px-4 py-2">水道代</th>
                  <th className="px-4 py-2">ガス代</th>
                  <th className="px-4 py-2">その他1</th>
                  <th className="px-4 py-2">その他2</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="border px-4 py-2 text-center">
                      選択した年・月のデータがありません。
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => {
                    const total =
                      parseFloat(item.electricity || 0) +
                      parseFloat(item.water || 0) +
                      parseFloat(item.gas || 0) +
                      parseFloat(item.other1 || 0) +
                      parseFloat(item.other2 || 0);

                    return (
                      <tr key={item.id}>
                        <td className="border px-4 py-2">{item.rentRoll.floor}</td>
                        <td className="border px-4 py-2">{item.rentRoll.roomNumber}</td>
                        <td className="border px-4 py-2">{item.rentRoll.roomUsage}</td>
                        <td className="border px-4 py-2">{item.rentRoll.contractor}</td>
                        <td className="border px-4 py-2">{item.rentRoll.originalContractor}</td>
                        {editUtilityId === item.id ? (
                          <>
                            <td className="border px-4 py-2">
                              <input
                                type="number"
                                name="electricity"
                                value={editFormData.electricity}
                                onChange={handleEditChange}
                                className="w-full border p-1 rounded"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td className="border px-4 py-2">
                              <input
                                type="number"
                                name="water"
                                value={editFormData.water}
                                onChange={handleEditChange}
                                className="w-full border p-1 rounded"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td className="border px-4 py-2">
                              <input
                                type="number"
                                name="gas"
                                value={editFormData.gas}
                                onChange={handleEditChange}
                                className="w-full border p-1 rounded"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td className="border px-4 py-2">
                              <input
                                type="number"
                                name="other1"
                                value={editFormData.other1}
                                onChange={handleEditChange}
                                className="w-full border p-1 rounded"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td className="border px-4 py-2">
                              <input
                                type="number"
                                name="other2"
                                value={editFormData.other2}
                                onChange={handleEditChange}
                                className="w-full border p-1 rounded"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td className="border px-4 py-2">{total.toFixed(2)}</td>
                            <td className="border px-4 py-2">
                              <button
                                onClick={handleEditSubmit}
                                className="text-green-500 hover:text-green-700 mr-2"
                              >
                                保存
                              </button>
                              <button
                                onClick={() => setEditUtilityId(null)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                キャンセル
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="border px-4 py-2">{item.electricity}</td>
                            <td className="border px-4 py-2">{item.water}</td>
                            <td className="border px-4 py-2">{item.gas}</td>
                            <td className="border px-4 py-2">{item.other1}</td>
                            <td className="border px-4 py-2">{item.other2}</td>
                            <td className="border px-4 py-2">{total.toFixed(2)}</td>
                            <td className="border px-4 py-2 relative">
                              <button
                                onClick={(e) => handleMenuClick(e, item.id)}
                                className="text-gray-500 hover:text-gray-700 mr-2"
                              >
                                ...
                              </button>
                              {/* コンテキストメニュー */}
                              {contextMenuUtilityId === item.id && (
                                <div
                                  className="absolute bg-white border shadow-md rounded py-2 px-4 z-50"
                                  style={{ top: "100%", left: 0 }}
                                  onClick={(e) => e.stopPropagation()} // メニュー内クリックを伝播させない
                                >
                                  <button
                                    onClick={() => handleEditClick(item)}
                                    className="block text-blue-600 hover:underline mb-2"
                                  >
                                    編集
                                  </button>
                                  <button
                                    onClick={handleDelete}
                                    className="block text-red-600 hover:underline"
                                  >
                                    削除する
                                  </button>
                                </div>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UtilityExpenses;
