import React, { useState } from "react";

const RegisterProperty = ({ onPropertyRegistered }) => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const property = { name };

    try {
      const response = await fetch("http://localhost:8080/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(property),
        mode: "cors",
        credentials: "include",
      });

      if (response.ok) {
        setMessage("物件が登録されました！");
        setName("");
        setIsModalOpen(false); // モーダルを閉じる

        // リストを再取得
        if (onPropertyRegistered) {
          onPropertyRegistered();
        }
      } else {
        const errorData = await response.json();
        setMessage(`物件登録に失敗しました: ${errorData.message || ""}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("エラーが発生しました。");
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <button
        onClick={openModal}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        新規登録
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-xl font-bold mb-4">新規物件登録</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">物件名:</label>
                <input
                  type="text"
                  className="border rounded p-2 w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeModal}
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

      {message && <p className="mt-4 text-green-500">{message}</p>}
    </div>
  );
};

export default RegisterProperty;
