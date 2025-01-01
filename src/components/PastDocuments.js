import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const PastDocuments = () => {
  const { propertyId } = useParams();

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [contextMenuDocId, setContextMenuDocId] = useState(null); 
  const [contextMenuPosition, setContextMenuPosition] = useState({x:0, y:0});

  const fetchUploadedFiles = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/properties/${propertyId}/past-documents`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedFiles(data);
      } else {
        console.error("アップロード済み資料の取得に失敗しました。");
      }
    } catch (error) {
      console.error("アップロード済み資料取得中にエラーが発生しました:", error);
    }
  };

  useEffect(() => {
    if (propertyId) {
      fetchUploadedFiles();
    }
  }, [propertyId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`http://localhost:8080/api/properties/${propertyId}/past-documents/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("ファイルアップロード成功");
        fetchUploadedFiles();
      } else {
        console.error("ファイルアップロード失敗");
      }
    } catch (error) {
      console.error("ファイルアップロード中にエラーが発生しました:", error);
    }
  };

  const handleFileClick = (docId) => {
    const url = `http://localhost:8080/api/properties/${propertyId}/past-documents/${docId}/download`;
    window.open(url, '_blank');
  };

  const handleMenuClick = (e, docId) => {
    e.preventDefault();
    e.stopPropagation(); // イベント伝播を止める
    const rect = e.target.getBoundingClientRect();
    setContextMenuPosition({ x: rect.left, y: rect.bottom });
    setContextMenuDocId(docId);
  };

  const handleDelete = async () => {
    if (!contextMenuDocId) return;

    try {
      const response = await fetch(`http://localhost:8080/api/properties/${propertyId}/past-documents/${contextMenuDocId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        console.log("ファイルを削除しました。");
        setContextMenuDocId(null);
        fetchUploadedFiles();
      } else {
        console.error("ファイル削除失敗");
      }
    } catch (error) {
      console.error("ファイル削除中にエラーが発生しました:", error);
    }
  };

  // メニュー外をクリックしたらメニューを閉じる
  const handleOutsideClick = (e) => {
    if (contextMenuDocId) {
      // メニュー外クリックならメニュー閉じる
      setContextMenuDocId(null);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header propertyId={propertyId} />
      <div className="flex flex-1">
        <Sidebar propertyId={propertyId} />

        {/* メインコンテナ: ここでonClickで外側クリックを検知 */}
        <div className="flex-1 p-4" onClick={handleOutsideClick}>
          <h1 className="text-xl font-bold mb-4">{propertyId} の過去資料</h1>
          <p>ここで過去のエクセルやPDFファイルを表示・アップロードできます。</p>
          
          <div className="mt-4">
            <label className="block mb-2">ファイルアップロード:</label>
            <input type="file" className="border p-2 rounded w-full" onChange={handleFileUpload} />
          </div>

          <div className="mt-4 relative">
            <h2 className="text-lg font-semibold mb-2">アップロード済み資料:</h2>
            <ul className="list-disc list-inside">
              {uploadedFiles.length === 0 ? (
                <li>アップロード済みの資料はありません。</li>
              ) : (
                uploadedFiles.map((doc) => (
                  <li key={doc.id} className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleFileClick(doc.id);} } 
                      className="text-blue-600 underline"
                    >
                      {doc.fileName}
                    </button>
                    <button 
                      onClick={(e) => handleMenuClick(e, doc.id)} 
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ...
                    </button>
                  </li>
                ))
              )}
            </ul>

            {/* コンテキストメニュー */}
            {contextMenuDocId && (
              <div 
                className="absolute bg-white border shadow-md rounded py-2 px-4 z-50"
                style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
                onClick={(e) => e.stopPropagation()} // メニュー内クリックは閉じない
              >
                <button 
                  onClick={handleDelete} 
                  className="block text-red-600 hover:underline"
                >
                  削除する
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastDocuments;
