// src/components/RegisterDepositIcon.js
import React, { useState, useEffect } from "react";

const RegisterDepositIcon = ({ propertyId, onNewDeposit }) => {
  const [showModal, setShowModal] = useState(false);
  const [rentRollOptions, setRentRollOptions] = useState([]);
  const [selectedRentRollId, setSelectedRentRollId] = useState("");
  const [formData, setFormData] = useState({
    deposit: "",
    suubiki: "",
    guaranteeMoney: "",
    reikin: "",
  });

  // RentRollオプションの取得
  const fetchRentRollOptions = async () => {
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
        setRentRollOptions(data);
      } else {
        console.error("RentRollオプションの取得に失敗しました。");
      }
    } catch (error) {
      console.error("ネットワークエラー:", error);
    }
  };

  useEffect(() => {
    if (propertyId) {
      fetchRentRollOptions();
    }
  }, [propertyId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRentRollId) {
      alert("RentRollエントリを選択してください。");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/properties/${propertyId}/deposit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rentRollId: selectedRentRollId,
            deposit: parseFloat(formData.deposit),
            suubiki: parseFloat(formData.suubiki),
            guaranteeMoney: parseFloat(formData.guaranteeMoney),
            reikin: parseFloat(formData.reikin),
          }),
        }
      );

      if (response.ok) {
        const newDeposit = await response.json();
        onNewDeposit(newDeposit);
        setShowModal(false);
        setFormData({
          deposit: "",
          suubiki: "",
          guaranteeMoney: "",
          reikin: "",
        });
        setSelectedRentRollId("");
      } else {
        const errorData = await response.json();
        alert(
          `デポジットの登録に失敗しました: ${errorData.message || ""}`
        );
      }
    } catch (error) {
      console.error("デポジット登録中にエラーが発生しました:", error);
      alert("デポジット登録中にエラーが発生しました。");
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-blue-500 hover:text-blue-700"
      >
        ＋預託金登録
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl mb-4">預託金等の登録</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">RentRollエントリを選択</label>
                <select
                  value={selectedRentRollId}
                  onChange={(e) => setSelectedRentRollId(e.target.value)}
                  required
                  className="w-full border p-2 rounded"
                >
                  <option value="">選択してください</option>
                  {rentRollOptions.map((rentRoll) => (
                    <option key={rentRoll.id} value={rentRoll.id}>
                      {`${rentRoll.floor}階 No.${rentRoll.roomNumber} ${rentRoll.roomUsage} ${rentRoll.contractor}`}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="number"
                name="deposit"
                placeholder="敷金"
                value={formData.deposit}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
                min="0"
                step="0.01"
              />
              <input
                type="number"
                name="suubiki"
                placeholder="数引"
                value={formData.suubiki}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
                min="0"
                step="0.01"
              />
              <input
                type="number"
                name="guaranteeMoney"
                placeholder="保証金"
                value={formData.guaranteeMoney}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
                min="0"
                step="0.01"
              />
              <input
                type="number"
                name="reikin"
                placeholder="礼金"
                value={formData.reikin}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded"
                min="0"
                step="0.01"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  登録
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RegisterDepositIcon;
