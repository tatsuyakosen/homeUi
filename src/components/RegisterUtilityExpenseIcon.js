import React, { useState, useEffect } from "react";

const RegisterUtilityExpenseIcon = ({ propertyId, onNewUtilityExpense }) => {
  const [showModal, setShowModal] = useState(false);
  const [rentRollOptions, setRentRollOptions] = useState([]);
  const [selectedRentRollId, setSelectedRentRollId] = useState("");
  const [formData, setFormData] = useState({
    electricity: "",
    water: "",
    gas: "",
    other1: "",
    other2: "",
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
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
        `http://localhost:8080/api/properties/${propertyId}/utility-expenses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rentRollId: selectedRentRollId,
            electricity: parseFloat(formData.electricity),
            water: parseFloat(formData.water),
            gas: parseFloat(formData.gas),
            other1: parseFloat(formData.other1) || 0,
            other2: parseFloat(formData.other2) || 0,
          }),
        }
      );

      if (response.ok) {
        const newUtilityExpense = await response.json();
        onNewUtilityExpense(newUtilityExpense); // 新規登録のデータを親コンポーネントに渡す
        setShowModal(false); // モーダルを閉じる
        setFormData({
          electricity: "",
          water: "",
          gas: "",
          other1: "",
          other2: "",
        });
        setSelectedRentRollId("");
        alert("水道光熱費を登録しました。");
      } else {
        const errorData = await response.json();
        alert(`登録に失敗しました: ${errorData.message || ""}`);
      }
    } catch (error) {
      console.error("登録中にエラーが発生しました:", error);
      alert("登録中にエラーが発生しました。");
    }
  };

  return (
    <>
      {/* 登録ボタン */}
      <button
        onClick={() => setShowModal(true)}
        className="text-blue-500 hover:text-blue-700"
      >
        ＋水道光熱費登録
      </button>

      {/* モーダル */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl mb-4">水道光熱費の登録</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* RentRoll選択 */}
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

              {/* 入力フィールド */}
              <div>
                <label className="block mb-1">電気代</label>
                <input
                  type="number"
                  name="electricity"
                  value={formData.electricity}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block mb-1">水道代</label>
                <input
                  type="number"
                  name="water"
                  value={formData.water}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block mb-1">ガス代</label>
                <input
                  type="number"
                  name="gas"
                  value={formData.gas}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block mb-1">その他1</label>
                <input
                  type="number"
                  name="other1"
                  value={formData.other1}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block mb-1">その他2</label>
                <input
                  type="number"
                  name="other2"
                  value={formData.other2}
                  onChange={handleInputChange}
                  className="w-full border p-2 rounded"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* ボタン */}
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

export default RegisterUtilityExpenseIcon;
