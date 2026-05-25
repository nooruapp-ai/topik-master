import { Outlet } from 'react-router-dom';
import TabBar from './ui/TabBar';

export default function Layout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-mobile flex-col bg-surface-soft">
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
