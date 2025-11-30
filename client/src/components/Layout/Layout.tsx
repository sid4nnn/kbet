import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import { Outlet } from 'react-router-dom';
import type { User } from '../../pages/AuthPage';
import type { Notification } from '../Topbar/NotificationDropdown';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  notifications: Notification[];
}

const Layout = ({ user, onLogout, notifications }: LayoutProps) => {
  return (
    <div className="flex h-screen bg-[#0f1923] text-white overflow-hidden font-sans">

      <Sidebar />


      <div className="flex-1 flex flex-col min-w-0">

        <Topbar user={user} onLogout={onLogout} notifications={notifications} />


        <main className="flex-1 overflow-y-auto bg-[#0f1923]">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
