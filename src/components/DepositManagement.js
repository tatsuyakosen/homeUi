import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import RegisterDepositIcon from "./RegisterDepositIcon";

const DepositManagement = () => {
  const { propertyId } = useParams();

  const [depositData, setDepositData] = useState([]);
  const [rentRollData, setRentRollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contextMenuDepositId, setContextMenuDepositId] = useState(null);
  const [editDepositId, setEditDepositId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    deposit: "",
    suubiki: "",
    guaranteeMoney: "",
    reikin: "",
  });

  // 年度・月の選択
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
    }
  };

  // デポジットデータの取得
  const fetchDepositData = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/properties/${propertyId}/deposit`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDepositData(data);
      } else {
        const errorData = await response.json();
        setError(
          `預託金データの取得に失敗しました: ${errorData.message || ""}`
        );
        console.error("Error fetching deposit data:", errorData);
      }
    } catch (error) {
      setError("エラーが発生しました: " + error.message);
      console.error("Network error:", error);
    }
  };

  useEffect(() => {
    if (propertyId) {
      // rentRollDataとdepositDataを順次取得
      fetchRentRollData().then(() => {
        fetchDepositData().then(() => {
          setLoading(false);
        });
      });
    }
  }, [propertyId]);

  const handleNewDeposit = (newDeposit) => {
    setDepositData((prevData) => [...prevData, newDeposit]);
  };

  // デポジット削除ハンドラ
  const handleDelete = async () => {
    if (!contextMenuDepositId) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/properties/${propertyId}/deposit/${contextMenuDepositId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        console.log("デポジットを削除しました。");
        setContextMenuDepositId(null);
        // 削除後にデータを再取得
        fetchDepositData();
      } else {
        const errorData = await response.json();
        console.error("デポジット削除失敗:", errorData);
        alert(`デポジット削除に失敗しました: ${errorData.message || ""}`);
      }
    } catch (error) {
      console.error("デポジット削除中にエラーが発生しました:", error);
      alert("デポジット削除中にエラーが発生しました。");
    }
  };

  // メニュー表示ハンドラ
  const handleMenuClick = (e, depositId) => {
    e.preventDefault();
    e.stopPropagation(); // イベント伝播を停止
    setContextMenuDepositId(depositId);
  };

  // メニュー外クリックでメニューを閉じる
  const handleOutsideClick = () => {
    if (contextMenuDepositId) {
      setContextMenuDepositId(null);
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

  // RentRollのcreatedAtでフィルタリング
  const filteredRentRollData = rentRollData.filter((item) => {
    if (!item.createdAt) return false;
    const yearStr = item.createdAt.slice(0, 4);
    const monthStr = item.createdAt.slice(5, 7);
    const itemYear = parseInt(yearStr, 10);
    const itemMonth = parseInt(monthStr, 10);

    return itemYear === selectedYear && itemMonth === selectedMonth;
  });

  // filteredRentRollDataを元にdepositデータをマージ
  // depositDataには rentRoll.idに紐づく depositがある想定
  // depositは複数あるかもしれないが、RentRoll:Depositは1:1想定ならfindでOK
  const mergedData = filteredRentRollData.map((roll) => {
    const dep = depositData.find((d) => d.rentRoll && d.rentRoll.id === roll.id);

    return {
      id: dep ? dep.id : null, // depositが無い場合null
      rentRoll: roll,
      deposit: dep ? dep.deposit : 0,
      suubiki: dep ? dep.suubiki : 0,
      guaranteeMoney: dep ? dep.guaranteeMoney : 0,
      reikin: dep ? dep.reikin : 0,
    };
  });

  // 編集モードに入るハンドラ
  const handleEditClick = (deposit) => {
    setEditDepositId(deposit.id);
    setEditFormData({
      deposit: deposit.deposit,
      suubiki: deposit.suubiki,
      guaranteeMoney: deposit.guaranteeMoney,
      reikin: deposit.reikin,
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
        `http://localhost:8080/api/properties/${propertyId}/deposit/${editDepositId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deposit: parseFloat(editFormData.deposit),
            suubiki: parseFloat(editFormData.suubiki),
            guaranteeMoney: parseFloat(editFormData.guaranteeMoney),
            reikin: parseFloat(editFormData.reikin),
          }),
        }
      );

      if (response.ok) {
        const updatedDeposit = await response.json();
        setDepositData((prevData) =>
          prevData.map((dep) => (dep.id === updatedDeposit.id ? updatedDeposit : dep))
        );
        setEditDepositId(null);
        alert("デポジットを更新しました。");
      } else {
        const errorData = await response.json();
        alert(`デポジットの更新に失敗しました: ${errorData.message || ""}`);
      }
    } catch (error) {
      console.error("デポジット更新中にエラーが発生しました:", error);
      alert("デポジット更新中にエラーが発生しました。");
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
          <h3 className="text-lg font-semibold mb-4">{propertyId} の預託金等</h3>
          <div className="absolute top-4 right-4">
            <RegisterDepositIcon
              propertyId={propertyId}
              onNewDeposit={handleNewDeposit}
            />
          </div>

          {/* 年度選択プルダウン */}
          {yearSelect}

          {/* 月選択タブ */}
          {monthTabs}

          {/* デポジットデータ表示 */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2" rowSpan="2">階</th>
                  <th className="px-4 py-2" rowSpan="2">No.</th>
                  <th className="px-4 py-2" rowSpan="2">用途</th>
                  <th className="px-4 py-2" rowSpan="2">契約者</th>
                  <th className="px-4 py-2" colSpan="4">預託金等</th>
                  <th className="px-4 py-2" rowSpan="2">操作</th>
                </tr>
                <tr>
                  <th className="px-4 py-2">敷金</th>
                  <th className="px-4 py-2">数引</th>
                  <th className="px-4 py-2">保証金</th>
                  <th className="px-4 py-2">礼金</th>
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
                    <tr key={item.rentRoll.id}>
                      <td className="border px-4 py-2">{item.rentRoll.floor}</td>
                      <td className="border px-4 py-2">{item.rentRoll.roomNumber}</td>
                      <td className="border px-4 py-2">{item.rentRoll.roomUsage}</td>
                      <td className="border px-4 py-2">{item.rentRoll.contractor}</td>
                      {editDepositId === item.id && item.id !== null ? (
                        <>
                          <td className="border px-4 py-2">
                            <input
                              type="number"
                              name="deposit"
                              value={editFormData.deposit}
                              onChange={handleEditChange}
                              className="w-full border p-1 rounded"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="border px-4 py-2">
                            <input
                              type="number"
                              name="suubiki"
                              value={editFormData.suubiki}
                              onChange={handleEditChange}
                              className="w-full border p-1 rounded"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="border px-4 py-2">
                            <input
                              type="number"
                              name="guaranteeMoney"
                              value={editFormData.guaranteeMoney}
                              onChange={handleEditChange}
                              className="w-full border p-1 rounded"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="border px-4 py-2">
                            <input
                              type="number"
                              name="reikin"
                              value={editFormData.reikin}
                              onChange={handleEditChange}
                              className="w-full border p-1 rounded"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="border px-4 py-2">
                            <button
                              onClick={handleEditSubmit}
                              className="text-green-500 hover:text-green-700 mr-2"
                            >
                              保存
                            </button>
                            <button
                              onClick={() => setEditDepositId(null)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              キャンセル
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="border px-4 py-2">{item.deposit}</td>
                          <td className="border px-4 py-2">{item.suubiki}</td>
                          <td className="border px-4 py-2">{item.guaranteeMoney}</td>
                          <td className="border px-4 py-2">{item.reikin}</td>
                          <td className="border px-4 py-2 relative">
                            {item.id !== null && (
                              <>
                                <button
                                  onClick={(e) => handleMenuClick(e, item.id)}
                                  className="text-gray-500 hover:text-gray-700 mr-2"
                                >
                                  ...
                                </button>
                                {contextMenuDepositId === item.id && (
                                  <div
                                    className="absolute bg-white border shadow-md rounded py-2 px-4 z-50"
                                    style={{ top: "100%", left: 0 }}
                                    onClick={(e) => e.stopPropagation()}
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
                              </>
                            )}
                          </td>
                        </>
                      )}
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

export default DepositManagement;
