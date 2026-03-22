import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
