import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RegisterProperty from "./RegisterProperty";

const Tafu = () => {
  const [properties, setProperties] = useState([]);
  const navigate = useNavigate();

  // 物件リストを取得する関数
  const fetchProperties = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/properties", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      } else {
        console.error("物件リストの取得に失敗しました。");
      }
    } catch (error) {
      console.error("エラーが発生しました:", error);
    }
  };

  // 初回レンダリング時に物件を取得
  useEffect(() => {
    fetchProperties();
  }, []);

  const handleNavigateToDashboard = (propertyId, propertyName) => {
    navigate(`/dashboard/${propertyId}`, { state: { propertyName } });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-5xl font-extrabold mb-6 text-gray-800">タフホールディングス</h1>

      <div className="mb-10">
        <h2 className="text-lg mb-4 text-gray-700">物件一覧:</h2>
        <ul className="list-disc list-inside">
          {properties.map((property) => (
            <li
              key={property.id}
              className="text-blue-500 cursor-pointer hover:underline"
              onClick={() => handleNavigateToDashboard(property.id, property.name)} // 修正: propertyId と propertyName を渡す
            >
              {property.name}
            </li>
          ))}
        </ul>
      </div>

      <div>
        {/* fetchProperties を渡す */}
        <RegisterProperty onPropertyRegistered={fetchProperties} />
      </div>
    </div>
  );
};

export default Tafu;
