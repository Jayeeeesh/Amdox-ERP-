import { Menu, Bell } from "lucide-react";
import useAuthStore from "../store/authStore";

const Header = ({ onMenuClick, title }) => {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-700"
        >
          <Menu size={22} />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
