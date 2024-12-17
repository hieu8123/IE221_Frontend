const { default: Image } = require("next/legacy/image");

const AdminHeader = () => {
  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Type to search..."
          className="bg-gray-200 p-2 rounded w-1/2"
        />
        <div className="flex items-center space-x-4">
          <span>🔔</span>
          <span>💬</span>
          <Image
            src="https://via.placeholder.com/40"
            alt="User"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h4 className="font-semibold">Lê Hiếu</h4>
            <span className="text-sm text-gray-500">Chủ cửa hàng</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
