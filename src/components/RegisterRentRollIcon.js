import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const RegisterRentRollIcon = ({ propertyId, onNewRentRoll }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRentRoll, setNewRentRoll] = useState({
    floor: "",
    roomNumber: "",
    roomUsage: "",
    contractor: "",
    contractDate: null, // DatePicker利用のためnull初期化
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

  // 数値項目を定義
  const numericFields = [
    "floor",
    "rentalArea",
    "rent",
    "maintenanceFee",
    "tax",
    "totalRent",
    "unitPrice",
    "parkingFee",
    "bikeParkingFee",
    "bicycleParkingFee",
    "storageFee",
    "totalFee",
    "bicycleParkingNumber",
    "renewalFee",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!propertyId) {
      console.error("Property ID is undefined");
      alert("Property ID が未定義です。操作を続行できません。");
      return;
    }

    const rentRollToSend = { ...newRentRoll };

    // contractDateがDateオブジェクトの場合、"yyyy/MM/dd"形式に変換
    if (rentRollToSend.contractDate instanceof Date) {
      const year = rentRollToSend.contractDate.getFullYear();
      const month = String(rentRollToSend.contractDate.getMonth() + 1).padStart(2, "0");
      const day = String(rentRollToSend.contractDate.getDate()).padStart(2, "0");
      rentRollToSend.contractDate = `${year}/${month}/${day}`;
    } else if (!rentRollToSend.contractDate) {
      rentRollToSend.contractDate = null;
    }

    // createdAtフィールド追加 ( "yyyy/MM/dd"形式 )
    const now = new Date();
    const cYear = now.getFullYear();
    const cMonth = String(now.getMonth() + 1).padStart(2, '0');
    const cDay = String(now.getDate()).padStart(2, '0');
    rentRollToSend.createdAt = `${cYear}/${cMonth}/${cDay}`;

    // 数値項目のバリデーションと変換
    for (let field of numericFields) {
      const val = rentRollToSend[field];
      if (val === "" || val === null) {
        rentRollToSend[field] = 0;
      } else {
        const num = Number(val);
        if (isNaN(num)) {
          alert(`"${fieldLabels[field]}"に無効な数値が入力されています。正しい値を入力してください。`);
          return; // バリデーション失敗で送信中断
        }
        rentRollToSend[field] = num;
      }
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/properties/${propertyId}/rentroll`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rentRollToSend),
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
          contractDate: null,
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
              {Object.keys(newRentRoll).map((key) => {
                if (key === "contractDate") {
                  return (
                    <div key={key} className="mb-4">
                      <label className="block text-gray-700 mb-2">{fieldLabels[key]}:</label>
                      <DatePicker
                        selected={newRentRoll.contractDate}
                        onChange={(date) => setNewRentRoll({ ...newRentRoll, contractDate: date })}
                        dateFormat="yyyy/MM/dd"
                        placeholderText="日付を選択"
                        className="border rounded p-2 w-full"
                      />
                    </div>
                  );
                } else {
                  const isNumeric = numericFields.includes(key);
                  return (
                    <div key={key} className="mb-4">
                      <label className="block text-gray-700 mb-2">{fieldLabels[key]}:</label>
                      <input
                        type={isNumeric ? "number" : "text"}
                        className="border rounded p-2 w-full"
                        value={newRentRoll[key] || ""}
                        onChange={(e) =>
                          setNewRentRoll({ ...newRentRoll, [key]: e.target.value })
                        }
                        required={key !== "bicycleParkingNumber"} 
                      />
                    </div>
                  );
                }
              })}
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
