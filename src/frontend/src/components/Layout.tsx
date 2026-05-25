import { Outlet } from 'react-router-dom';
import TabBar from './TabBar';

export default function Layout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-mobile flex-col bg-gray-50 shadow-sm">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
