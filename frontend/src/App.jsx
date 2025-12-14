
import React from 'react';
import TicketSubmissionPage from './components/TicketSubmissionPage';
import TicketStatusPage from './components/TicketStatusPage';
import AdminDashboard from './components/AdminDashboard';
import { TicketProvider } from './context/TicketContext.jsx';
import './App.css';

function App() {
  const [page, setPage] = React.useState('submit');
  return (
    <TicketProvider>
      <div className="app-container">
        <nav>
          <button className={page === 'submit' ? 'active' : ''} onClick={() => setPage('submit')}>Submit Ticket</button>
          <button className={page === 'status' ? 'active' : ''} onClick={() => setPage('status')}>Check Status</button>
          <button className={page === 'admin' ? 'active' : ''} onClick={() => setPage('admin')}>Admin Dashboard</button>
        </nav>
        <hr/>
        {page === 'submit' && <TicketSubmissionPage />}
        {page === 'status' && <TicketStatusPage />}
        {page === 'admin' && <AdminDashboard />}
      </div>
    </TicketProvider>
  );
}

export default App;
