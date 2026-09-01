import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LifeBuoy,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  User,
  Eye,
  X,
  Send,
} from 'lucide-react';
import API from '../../api';

const ITEMS_PER_PAGE = 10;

export default function AdminSupport() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // ─── Detail modal state ──────────────────────────────────────────
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetail, setTicketDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  // ─── Fetch tickets ──────────────────────────────────────────────
  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/support/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
      if (err.response?.status === 401) {
        navigate('/admin-login', { replace: true });
        return;
      }
      setError('Could not load support tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // ─── Filter and pagination ──────────────────────────────────────
  const filteredTickets = tickets.filter((ticket) => {
    const matchSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.user_name && ticket.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.user_email && ticket.user_email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // ─── View ticket details ──────────────────────────────────────────
  const handleView = async (ticket) => {
    setSelectedTicket(ticket);
    setLoadingDetail(true);
    setShowModal(true);
    try {
      const res = await API.get(`/support/tickets/${ticket.id}`);
      setTicketDetail(res.data);
    } catch (err) {
      console.error('Detail fetch error:', err);
      setNotification({ type: 'error', message: 'Could not load ticket details.' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ─── Send reply ──────────────────────────────────────────────────
  const handleReply = async () => {
    if (!replyMessage.trim()) return;
    setActionInProgress(true);
    try {
      await API.post(`/support/tickets/${selectedTicket.id}/reply`, { message: replyMessage });
      // Refresh ticket details
      const res = await API.get(`/support/tickets/${selectedTicket.id}`);
      setTicketDetail(res.data);
      setReplyMessage('');
      // Also refresh the list to update status
      await fetchTickets();
      setNotification({ type: 'success', message: 'Reply sent successfully.' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    } catch (err) {
      console.error('Reply error:', err);
      setNotification({ type: 'error', message: 'Failed to send reply.' });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    } finally {
      setActionInProgress(false);
    }
  };

  // ─── Close modal ──────────────────────────────────────────────────
  const closeModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
    setTicketDetail(null);
    setReplyMessage('');
  };

  // ─── Status badge ──────────────────────────────────────────────
  const StatusBadge = ({ status }) => {
    const config = {
      open: { label: 'Open', icon: AlertCircle, className: 'bg-yellow-100 text-yellow-700' },
      'in-progress': { label: 'In Progress', icon: Clock, className: 'bg-blue-100 text-blue-700' },
      resolved: { label: 'Resolved', icon: CheckCircle, className: 'bg-green-100 text-green-700' },
      closed: { label: 'Closed', icon: XCircle, className: 'bg-gray-100 text-gray-500' },
    };
    const { label, icon: Icon, className } = config[status] || config.open;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${className}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  // ─── Priority badge ─────────────────────────────────────────────
  const PriorityBadge = ({ priority }) => {
    const config = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config[priority] || config.medium}`}>
        {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Medium'}
      </span>
    );
  };

  // ─── Render ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-3" />
        <p className="font-medium">{error}</p>
        <button
          onClick={fetchTickets}
          className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-indigo-600" />
            Support Tickets
          </h2>
          <p className="text-sm text-gray-500">{tickets.length} total tickets</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search subject, message, user..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <button
            onClick={fetchTickets}
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition shadow-sm"
            title="Refresh"
            disabled={actionInProgress}
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* ─── Notification ──────────────────────────────────────────── */}
      {notification.message && (
        <div
          className={`rounded-xl p-4 text-sm flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          {notification.message}
        </div>
      )}

      {/* ─── Table ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Subject</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">User</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Priority</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Created</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedTickets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all'
                      ? 'No tickets match your filters.'
                      : 'No tickets available.'}
                  </td>
                </tr>
              ) : (
                paginatedTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-800 font-medium">#{ticket.id}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium truncate max-w-[200px]">
                      {ticket.subject}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400" />
                        <span>{ticket.user_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleView(ticket)}
                        className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition"
                        title="View & Reply"
                        disabled={actionInProgress}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination ──────────────────────────────────────────── */}
        {filteredTickets.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredTickets.length)} of {filteredTickets.length}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || actionInProgress}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || actionInProgress}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Modal: Ticket Detail & Reply ────────────────────────── */}
      {showModal && ticketDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Ticket #{ticketDetail.id}: {ticketDetail.subject}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                disabled={actionInProgress}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Ticket info */}
            <div className="grid grid-cols-2 gap-3 mb-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <span className="text-sm text-gray-500">From:</span>
                <p className="font-medium text-gray-800">{ticketDetail.user_name} ({ticketDetail.user_email})</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Status:</span>
                <div className="mt-1">
                  <StatusBadge status={ticketDetail.status} />
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Priority:</span>
                <div className="mt-1">
                  <PriorityBadge priority={ticketDetail.priority} />
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Created:</span>
                <p className="font-medium text-gray-800">
                  {new Date(ticketDetail.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Original message */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-1">Message</h4>
              <div className="bg-gray-50 rounded-xl p-4 text-gray-700 whitespace-pre-wrap">
                {ticketDetail.message}
              </div>
            </div>

            {/* Replies */}
            {ticketDetail.replies && ticketDetail.replies.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Replies</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {ticketDetail.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`p-3 rounded-xl ${reply.user_id === ticketDetail.user_id ? 'bg-blue-50 border border-blue-100' : 'bg-green-50 border border-green-100'}`}
                    >
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span className="font-semibold">{reply.user_name}</span>
                        <span>{new Date(reply.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reply form */}
            <div className="border-t border-gray-200 pt-4 mt-2">
              <h4 className="font-semibold text-gray-800 mb-2">Add Reply</h4>
              <div className="flex gap-2">
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  rows="2"
                />
                <button
                  onClick={handleReply}
                  disabled={!replyMessage.trim() || actionInProgress}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}