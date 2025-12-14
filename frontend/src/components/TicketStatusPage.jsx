import React, { useState } from 'react';
import axios from 'axios';

const TicketStatusPage = () => {
  const [ticketId, setTicketId] = useState('');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTicket = async () => {
    setError('');
    setLoading(true);
    setTicket(null);
    try {
      const res = await axios.get(`/tickets/${ticketId}`);
      setTicket(res.data);
    } catch (err) {
      setError('Ticket not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Check Ticket Status</h2>
      <div style={{display:'flex', gap:8, marginBottom:16}}>
        <input value={ticketId} onChange={e => setTicketId(e.target.value)} placeholder="Enter Ticket ID" />
        <button onClick={fetchTicket} disabled={loading || !ticketId}>Fetch</button>
      </div>
      {loading && <p style={{color:'#2563eb'}}>Loading...</p>}
      {error && <p style={{color:'#dc2626'}}>{error}</p>}
      {ticket && (
        <div style={{maxWidth: '800px'}}>
          {/* Status Header */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid #e5e7eb'}}>
            <h2 style={{margin: 0, fontSize: '24px', fontWeight: '600'}}>Ticket Details</h2>
            <span style={{
              padding: '8px 16px',
              backgroundColor: ticket.status === 'auto_resolved' ? '#d1fae5' : 
                             ticket.status === 'escalated' ? '#fee2e2' : 
                             ticket.status === 'awaiting_clarification' ? '#fef3c7' : '#f3f4f6',
              color: ticket.status === 'auto_resolved' ? '#065f46' : 
                     ticket.status === 'escalated' ? '#991b1b' : 
                     ticket.status === 'awaiting_clarification' ? '#92400e' : '#6b7280',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              textTransform: 'capitalize'
            }}>
              {ticket.status.replace('_', ' ')}
            </span>
          </div>
          
          {/* Ticket Info */}
          <div style={{marginBottom: '24px'}}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600'}}>{ticket.title}</h3>
            <p style={{margin: 0, color: '#6b7280', fontSize: '15px', lineHeight: '1.6'}}>{ticket.description}</p>
          </div>
          
          {/* Metadata Tags */}
          <div style={{display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap'}}>
            {ticket.category && (
              <div style={{
                padding: '8px 14px', 
                backgroundColor: '#f3f4f6', 
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                <span style={{color: '#6b7280', fontSize: '11px', textTransform: 'uppercase'}}>Category</span><br/>
                <span style={{color: '#111827'}}>{ticket.category}</span>
              </div>
            )}
            {ticket.priority && (
              <div style={{
                padding: '8px 14px', 
                backgroundColor: ticket.priority === 'high' ? '#fee2e2' : ticket.priority === 'medium' ? '#fef3c7' : '#d1fae5',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                <span style={{
                  color: ticket.priority === 'high' ? '#991b1b' : ticket.priority === 'medium' ? '#92400e' : '#065f46',
                  fontSize: '11px',
                  textTransform: 'uppercase'
                }}>Priority</span><br/>
                <span style={{
                  color: ticket.priority === 'high' ? '#991b1b' : ticket.priority === 'medium' ? '#92400e' : '#065f46'
                }}>{ticket.priority}</span>
              </div>
            )}
            {ticket.riskLevel && (
              <div style={{
                padding: '8px 14px', 
                backgroundColor: ticket.riskLevel === 'high' ? '#fee2e2' : ticket.riskLevel === 'medium' ? '#fef3c7' : '#d1fae5',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                <span style={{
                  color: ticket.riskLevel === 'high' ? '#991b1b' : ticket.riskLevel === 'medium' ? '#92400e' : '#065f46',
                  fontSize: '11px',
                  textTransform: 'uppercase'
                }}>Risk Level</span><br/>
                <span style={{
                  color: ticket.riskLevel === 'high' ? '#991b1b' : ticket.riskLevel === 'medium' ? '#92400e' : '#065f46'
                }}>{ticket.riskLevel}</span>
              </div>
            )}
            {ticket.isRoutineIssue !== undefined && (
              <div style={{
                padding: '8px 14px', 
                backgroundColor: ticket.isRoutineIssue ? '#d1fae5' : '#f3f4f6',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                <span style={{
                  color: ticket.isRoutineIssue ? '#065f46' : '#6b7280',
                  fontSize: '11px',
                  textTransform: 'uppercase'
                }}>Routine Issue</span><br/>
                <span style={{
                  color: ticket.isRoutineIssue ? '#065f46' : '#6b7280'
                }}>{ticket.isRoutineIssue ? 'Yes' : 'No'}</span>
              </div>
            )}
          </div>
          
          {/* Escalation Reason */}
          {ticket.escalationReason && (
            <div style={{
              marginBottom: '20px', 
              padding: '14px 16px', 
              backgroundColor: '#fef2f2', 
              borderLeft: '4px solid #dc2626',
              borderRadius: '6px'
            }}>
              <p style={{margin: 0, fontSize: '14px', lineHeight: '1.6'}}>
                <strong style={{color: '#991b1b'}}>Escalation Reason:</strong>{' '}
                <span style={{color: '#7f1d1d'}}>{ticket.escalationReason}</span>
              </p>
            </div>
          )}
          
          {/* Resolution Steps */}
          {ticket.resolutionSteps && (
            <div style={{
              marginBottom: '20px', 
              padding: '16px', 
              backgroundColor: '#f0fdf4', 
              borderLeft: '4px solid #10b981',
              borderRadius: '6px'
            }}>
              <h4 style={{margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#065f46'}}>Resolution Steps</h4>
              <pre style={{
                whiteSpace: 'pre-wrap', 
                fontFamily: 'system-ui, -apple-system, sans-serif', 
                margin: 0,
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#065f46'
              }}>{ticket.resolutionSteps}</pre>
              {ticket.resolutionUsedFallback && (
                <p style={{
                  fontSize: '12px', 
                  color: '#059669', 
                  marginTop: '12px',
                  fontStyle: 'italic',
                  padding: '8px',
                  backgroundColor: '#d1fae5',
                  borderRadius: '4px'
                }}>
                  ✓ Resolution used fallback heuristics (Knowledge Service not required)
                </p>
              )}
            </div>
          )}
          
          {/* Agent Decisions */}
          <div>
            <h4 style={{margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#111827'}}>Agent Decisions & Reasoning</h4>
            {ticket.agentDecisions && ticket.agentDecisions.length > 0 ? (
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                {ticket.agentDecisions.map((d, i) => (
                  <div key={i} style={{
                    padding: '16px', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                      <strong style={{fontSize: '15px', color: '#111827'}}>{d.agent} Agent</strong>
                      <span style={{
                        padding: '4px 10px',
                        backgroundColor: d.confidence >= 0.8 ? '#d1fae5' : d.confidence >= 0.6 ? '#fef3c7' : '#fee2e2',
                        color: d.confidence >= 0.8 ? '#065f46' : d.confidence >= 0.6 ? '#92400e' : '#991b1b',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {(d.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <p style={{margin: '6px 0', fontSize: '14px', color: '#374151'}}>
                      <strong>Decision:</strong> {d.decision}
                    </p>
                    {d.explanation && (
                      <p style={{
                        margin: '8px 0 0 0', 
                        fontSize: '13px', 
                        color: '#6b7280', 
                        fontStyle: 'italic',
                        lineHeight: '1.5',
                        padding: '8px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '4px'
                      }}>
                        {d.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                color: '#6b7280'
              }}>
                <p style={{margin: 0}}>No agent decisions available yet. Processing may be in progress.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketStatusPage;
