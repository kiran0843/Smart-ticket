import React, { useState } from 'react';
import axios from 'axios';

const TicketSubmissionPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/tickets', { title, description });
      setSuccess(true);
      setTicketId(response.data._id || response.data.id);
      setTitle('');
      setDescription('');
      console.log('Ticket created:', response.data);
    } catch (err) {
      console.error('Ticket submission error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to submit ticket.';
      setError(`Error: ${errorMessage}. Make sure the ticket service is running on port 5000.`);
      setTicketId('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Submit a Support Ticket</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter ticket title" />
        </div>
        <div>
          <label>Description:</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your issue" rows={4} />
        </div>
        <button type="submit" disabled={loading}>Submit</button>
      </form>
      {loading && <p style={{color:'#2563eb'}}>Submitting...</p>}
      {error && <p style={{color:'#dc2626'}}>{error}</p>}
      {success && (
        <div style={{color:'#059669', padding: '12px', border: '1px solid #059669', borderRadius: '4px', marginTop: '16px'}}>
          <p><strong>✅ Ticket submitted successfully!</strong></p>
          <p><strong>Ticket ID:</strong> <code style={{background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px'}}>{ticketId}</code></p>
          <p style={{fontSize: '14px', marginTop: '8px'}}>Use this ID to check your ticket status on the "Check Status" page.</p>
        </div>
      )}
    </div>
  );
};

export default TicketSubmissionPage;
