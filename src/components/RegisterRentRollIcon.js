import React, { useState } from "react";

const RegisterRentRollIcon = ({ propertyId, onNewRentRoll }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRentRoll, setNewRentRoll] = useState({
    floor: "",
    roomNumber: "",
    roomUsage: "",
    contractor: "",
    contractDate: "", // 日付フォーマット維持
    rentalArea: "",
    rent: "",
    maintenanceFee: "",
    tax: "",
    totalRent: "",
    unitPrice: "",
    parkingFee: "",
    bikeParkingFee: "",
    bicycleParkingFee: "",
    storageFee: "",
    totalFee: "",
    bicycleParkingNumber: "",
    renewalFee: "",
  });

  const fieldLabels = {
    floor: "階",
    roomNumber: "No.",
    roomUsage: "用途",
    contractor: "契約者",
    contractDate: "原契約日",
    rentalArea: "賃貸面積",
    rent: "賃料",
    maintenanceFee: "共益費",
    tax: "消費税",
    totalRent: "共込賃料",
    unitPrice: "坪単価",
    parkingFee: "駐車場（税込）",
    bikeParkingFee: "バイク",
    bicycleParkingFee: "駐輪場",
    storageFee: "倉庫",
    totalFee: "合計",
    bicycleParkingNumber: "駐輪場No.",
    renewalFee: "更新料（税込）",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!propertyId) {
      console.error("Property ID is undefined");
      alert("Property ID が未定義です。操作を続行できません。");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/properties/${propertyId}/rentroll`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newRentRoll),
        }
      );

      if (response.ok) {
        const data = await response.json();
        onNewRentRoll(data); // 新規登録後に親コンポーネントに通知
        setIsModalOpen(false);
        setNewRentRoll({
          floor: "",
          roomNumber: "",
          roomUsage: "",
          contractor: "",
          contractDate: "",
          rentalArea: "",
          rent: "",
          maintenanceFee: "",
          tax: "",
          totalRent: "",
          unitPrice: "",
          parkingFee: "",
          bikeParkingFee: "",
          bicycleParkingFee: "",
          storageFee: "",
          totalFee: "",
          bicycleParkingNumber: "",
          renewalFee: "",
        });
      } else {
        console.error("登録に失敗しました。");
        const errorResponse = await response.json();
        alert(`登録エラー: ${errorResponse.message || "不明なエラー"}`);
      }
    } catch (error) {
      console.error("エラーが発生しました:", error);
      alert("ネットワークエラーが発生しました。");
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 text-white p-2 rounded-full shadow hover:bg-blue-700"
      >
        +
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-96 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">レントロール新規登録</h2>
            <form onSubmit={handleSubmit}>
              {Object.keys(newRentRoll).map((key) => (
                <div key={key} className="mb-4">
                  <label className="block text-gray-700 mb-2">{fieldLabels[key]}:</label>
                  <input
                    type="text"
                    className="border rounded p-2 w-full"
                    value={newRentRoll[key]}
                    onChange={(e) =>
                      setNewRentRoll({ ...newRentRoll, [key]: e.target.value })
                    }
                    required={key !== "bicycleParkingNumber"}
                  />
                </div>
              ))}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded mr-2 hover:bg-gray-400"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  登録
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterRentRollIcon;
