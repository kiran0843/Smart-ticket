import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEscalated();
  }, []);

  const fetchEscalated = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch all tickets and filter escalated
      const res = await axios.get('/tickets');
      const allTickets = res.data || [];
      const escalatedTickets = allTickets.filter(t => t.status === 'escalated' || t.status === 'Escalated');
      setTickets(escalatedTickets);
      console.log(`Found ${allTickets.length} total tickets, ${escalatedTickets.length} escalated`);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      setError(`Failed to fetch tickets: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resolveTicket = async (id) => {
    try {
      await axios.patch(`/tickets/${id}/status`, { status: 'Auto-Resolved' });
      fetchEscalated();
    } catch (err) {
      alert('Failed to resolve ticket.');
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p style={{color:'#6b7280', fontSize: '14px'}}>Showing escalated tickets requiring human review</p>
      {loading && <p style={{color:'#2563eb'}}>Loading...</p>}
      {error && <p style={{color:'#dc2626'}}>{error}</p>}
      {!loading && !error && tickets.length === 0 && (
        <div style={{padding: '20px', textAlign: 'center', color: '#6b7280'}}>
          <p>No escalated tickets at this time.</p>
          <p style={{fontSize: '12px', marginTop: '8px'}}>Tickets will appear here when agents escalate them for human review.</p>
        </div>
      )}
      {tickets.length > 0 && (
        <ul style={{listStyle: 'none', padding: 0}}>
          {tickets.map(t => (
            <li key={t._id} style={{
              marginBottom: '20px', 
              padding: '20px', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px', 
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              {/* Header with Title and Status Badge */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px'}}>
                <div style={{flex: 1}}>
                  <h3 style={{margin: 0, marginBottom: '4px', fontSize: '20px', fontWeight: '600'}}>{t.title}</h3>
                  <p style={{margin: 0, color: '#6b7280', fontSize: '14px'}}>{t.description}</p>
                </div>
                <span style={{
                  padding: '6px 12px', 
                  backgroundColor: '#fee2e2', 
                  color: '#991b1b', 
                  borderRadius: '6px', 
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Escalated
                </span>
              </div>
              
              {/* Metadata Tags */}
              <div style={{display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap'}}>
                {t.priority && (
                  <span style={{
                    padding: '6px 12px', 
                    backgroundColor: t.priority === 'high' ? '#fee2e2' : t.priority === 'medium' ? '#fef3c7' : '#d1fae5',
                    color: t.priority === 'high' ? '#991b1b' : t.priority === 'medium' ? '#92400e' : '#065f46',
                    borderRadius: '6px', 
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    Priority: {t.priority}
                  </span>
                )}
                {t.riskLevel && (
                  <span style={{
                    padding: '6px 12px', 
                    backgroundColor: t.riskLevel === 'high' ? '#fee2e2' : t.riskLevel === 'medium' ? '#fef3c7' : '#d1fae5',
                    color: t.riskLevel === 'high' ? '#991b1b' : t.riskLevel === 'medium' ? '#92400e' : '#065f46',
                    borderRadius: '6px', 
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    Risk: {t.riskLevel}
                  </span>
                )}
                {t.isRoutineIssue !== undefined && (
                  <span style={{
                    padding: '6px 12px', 
                    backgroundColor: t.isRoutineIssue ? '#d1fae5' : '#f3f4f6',
                    color: t.isRoutineIssue ? '#065f46' : '#6b7280',
                    borderRadius: '6px', 
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    Routine: {t.isRoutineIssue ? 'Yes' : 'No'}
                  </span>
                )}
                {t.category && (
                  <span style={{
                    padding: '6px 12px', 
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    borderRadius: '6px', 
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {t.category}
                  </span>
                )}
              </div>
              
              {/* Escalation Reason - Prominent but Clean */}
              {t.escalationReason && (
                <div style={{
                  marginBottom: '16px', 
                  padding: '12px 16px', 
                  backgroundColor: '#fef2f2', 
                  borderLeft: '4px solid #dc2626',
                  borderRadius: '4px'
                }}>
                  <p style={{margin: 0, fontSize: '14px'}}>
                    <strong style={{color: '#991b1b'}}>Escalation Reason:</strong>{' '}
                    <span style={{color: '#7f1d1d'}}>{t.escalationReason}</span>
                  </p>
                </div>
              )}
              
              {/* Agent Decisions - Better Formatting */}
              {t.agentDecisions && t.agentDecisions.length > 0 && (
                <div style={{marginBottom: '16px'}}>
                  <h4 style={{margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#374151'}}>Agent Analysis</h4>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    {t.agentDecisions.map((d, i) => (
                      <div key={i} style={{
                        padding: '12px', 
                        backgroundColor: '#f9fafb', 
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px'}}>
                          <strong style={{fontSize: '13px', color: '#111827'}}>{d.agent}</strong>
                          <span style={{
                            padding: '2px 8px',
                            backgroundColor: d.confidence >= 0.8 ? '#d1fae5' : d.confidence >= 0.6 ? '#fef3c7' : '#fee2e2',
                            color: d.confidence >= 0.8 ? '#065f46' : d.confidence >= 0.6 ? '#92400e' : '#991b1b',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {(d.confidence * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                        <p style={{margin: '4px 0 0 0', fontSize: '13px', color: '#374151'}}>
                          <strong>Decision:</strong> {d.decision}
                        </p>
                        {d.explanation && (
                          <p style={{margin: '6px 0 0 0', fontSize: '12px', color: '#6b7280', fontStyle: 'italic'}}>
                            {d.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Footer with Ticket ID and Action */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #e5e7eb'}}>
                <p style={{margin: 0, fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace'}}>
                  ID: {t._id}
                </p>
                <button 
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
                  onClick={() => resolveTicket(t._id)}
                >
                  Mark as Resolved
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminDashboard;
