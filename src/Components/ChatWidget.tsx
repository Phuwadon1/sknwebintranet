import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2';

// Utility to get or create Session ID for Guests
const getChatSession = () => {
    let sessionId = localStorage.getItem('chat_session_id');
    if (!sessionId) {
        sessionId = 'guest-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
        localStorage.setItem('chat_session_id', sessionId);
    }
    return sessionId;
};

const ChatWidget = () => {
    const { user, isAdmin } = useAuth(); // Get both user and isAdmin status
    const [isOpen, setIsOpen] = useState(false);

    // Guest State
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const guestSessionId = getChatSession();

    // Admin State
    const [sessions, setSessions] = useState<any[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [adminReply, setAdminReply] = useState('');
    const [lastUnreadCount, setLastUnreadCount] = useState(0);
    const [lastGuestMessageCount, setLastGuestMessageCount] = useState(0);
    const [guestUnreadCount, setGuestUnreadCount] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const chatButtonRef = useRef<HTMLButtonElement>(null);

    // Close chat when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isOpen &&
                chatContainerRef.current &&
                !chatContainerRef.current.contains(event.target as Node) &&
                chatButtonRef.current &&
                !chatButtonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const [editingMessage, setEditingMessage] = useState<any>(null); // For editing

    // Auto-open chat for guest users on first visit
    useEffect(() => {
        if (!user && !isOpen) {
            const hasSeenChat = sessionStorage.getItem('hasSeenChat');
            if (!hasSeenChat) {
                setTimeout(() => {
                    setIsOpen(true);
                    sessionStorage.setItem('hasSeenChat', 'true');
                }, 1000); // Delay 1 second after page load
            }
        }
    }, [user]);

    // Request notification permission for admin and guest
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Function to play notification sound
    const playNotificationSound = () => {
        try {
            // Use HTML5 Audio instead of Web Audio API
            // Simple beep sound using data URL
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
            audio.volume = 0.3;
            audio.play().catch(e => console.log('Audio play failed:', e));
        } catch (error) {
            console.error('Error playing notification sound:', error);
        }
    };

    // Function to show browser notification
    const showBrowserNotification = (title: string, body: string) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '/favicon.ico',
                tag: 'chat-notification',
                requireInteraction: false
            });
        }
    };

    // --- EFFECT: Poll for data when open ---
    useEffect(() => {
        let interval: any;

        if (isAdmin) {
            // Admin Mode: Always poll in background for notifications
            fetchSessions();
            interval = setInterval(() => {
                fetchSessions();
                // Only fetch messages if a session is selected and chat is open
                if (selectedSessionId && isOpen) {
                    fetchAdminMessages(selectedSessionId);
                }
            }, 3000); // 3s polling
        } else {
            // Guest Mode: Always poll for admin replies (even when closed)
            fetchGuestMessages();
            interval = setInterval(fetchGuestMessages, 3000);
        }

        return () => clearInterval(interval);
    }, [isOpen, isAdmin, selectedSessionId, lastUnreadCount, lastGuestMessageCount, guestUnreadCount]);

    // Scroll to bottom when messages change & Reset badge
    useEffect(() => {
        if (!editingMessage) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
        if (isOpen && !isAdmin) {
            setGuestUnreadCount(0);
        }
    }, [messages, isOpen, editingMessage, isAdmin]);

    // --- SHARED ---
    const handleEditClick = (msg: any) => {
        setEditingMessage(msg);
        if (isAdmin) {
            setAdminReply(msg.Message);
        } else {
            setNewMessage(msg.Message);
        }
    };

    const cancelEdit = () => {
        setEditingMessage(null);
        if (isAdmin) setAdminReply('');
        else setNewMessage('');
    };

    const submitEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        const content = isAdmin ? adminReply : newMessage;
        if (!content.trim() || !editingMessage) return;

        try {
            await api.put(`/chat/${editingMessage.ID}`, {
                message: content,
                session_id: user ? selectedSessionId : guestSessionId
            });

            // Clear edit state
            cancelEdit();

            // Refresh
            if (isAdmin && selectedSessionId) fetchAdminMessages(selectedSessionId);
            else fetchGuestMessages();

        } catch (error) {
            Swal.fire('Error', 'Update failed', 'error');
        }
    };

    // --- GUEST LOGIC ---
    const fetchGuestMessages = async () => {
        try {
            const res = await api.get(`/chat?session_id=${guestSessionId}`);
            const newMessages = res.data;

            // Check for new messages
            if (lastGuestMessageCount > 0 && newMessages.length > lastGuestMessageCount) {
                // Determine how many new messages
                const newlyAdded = newMessages.slice(lastGuestMessageCount);

                // Filter for Admin Replies
                const newAdminReplies = newlyAdded.filter((m: any) => m.IsAdminReply);

                if (newAdminReplies.length > 0) {
                    const latestMessage = newAdminReplies[newAdminReplies.length - 1];

                    // Show Browser Notification
                    showBrowserNotification(
                        'คำตอบจากเจ้าหน้าที่',
                        latestMessage.Message.substring(0, 50) + '...'
                    );

                    // Increment badge if chat is closed
                    if (!isOpen) {
                        setGuestUnreadCount(prev => prev + newAdminReplies.length);
                    }
                }
            }

            setMessages(newMessages);
            setLastGuestMessageCount(newMessages.length);
        } catch (error) {
            console.error("Error fetching guest chat:", error);
        }
    };

    const sendGuestMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingMessage) return submitEdit(e);

        if (!newMessage.trim()) return;
        try {
            // Send username if logged in, otherwise "Guest"
            const displayName = user ? (user.Fname || user.Username) : 'Guest';
            console.log('Sending message with username:', displayName, 'User object:', user);
            await api.post('/chat', {
                session_id: guestSessionId,
                message: newMessage,
                username: displayName
            });
            setNewMessage('');
            fetchGuestMessages();
        } catch (error) {
            console.error(error);
        }
    };

    // --- ADMIN LOGIC ---
    const fetchSessions = async () => {
        try {
            const res = await api.get('/chat/sessions');
            setSessions(res.data);
            const totalUnread = res.data.reduce((acc: number, s: any) => acc + s.UnreadCount, 0);
            if (totalUnread > lastUnreadCount) {
                // New message arrived - show notification (sound removed)

                // Find the session with new messages
                const newMessageSession = res.data.find((s: any) => s.UnreadCount > 0);
                if (newMessageSession) {
                    showBrowserNotification(
                        'ข้อความใหม่จากผู้ใช้',
                        `${newMessageSession.LastMessage.substring(0, 50)}...`
                    );
                }
            }
            setLastUnreadCount(totalUnread);
        } catch (error) {
            console.error("Error fetching sessions:", error);
        }
    };

    const fetchAdminMessages = async (sessionId: string) => {
        try {
            const res = await api.get(`/chat?session_id=${sessionId}&mark_read=true`);
            setMessages(res.data);
        } catch (error) {
            console.error("Error fetching admin chat:", error);
        }
    };

    const handleSessionSelect = (sessionId: string) => {
        setSelectedSessionId(sessionId);
        setMessages([]); // Clear view temporarily
        fetchAdminMessages(sessionId);
    };

    const sendAdminReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingMessage) return submitEdit(e);

        if (!adminReply.trim() || !selectedSessionId) return;
        try {
            await api.post('/chat', {
                session_id: selectedSessionId,
                message: adminReply,
                is_admin: true
            });
            setAdminReply('');
            fetchAdminMessages(selectedSessionId);
        } catch (error) {
            Swal.fire('Error', 'Failed to send', 'error');
        }
    };

    const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const result = await Swal.fire({
            title: 'ลบแชทนี้?',
            text: 'ข้อความทั้งหมดจะหายไปทั้งฝั่งเราและผู้ใช้',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'ลบเลย',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/chat/${sessionId}`);

                // Refresh list
                fetchSessions();

                // If current open, clear it
                if (selectedSessionId === sessionId) {
                    setSelectedSessionId(null);
                    setMessages([]);
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'ลบไม่สำเร็จ', 'error');
            }
        }
    };

    // --- RENDER ---

    // 1. Floating Button (Universal)
    const renderButton = () => (
        <button
            ref={chatButtonRef}
            className={`btn ${isAdmin ? 'btn-warning text-dark' : ''} rounded-circle shadow-lg position-fixed d-flex align-items-center justify-content-center`}
            style={{
                bottom: '20px',
                right: '20px',
                width: '60px',
                height: '60px',
                zIndex: 1060,
                backgroundColor: isAdmin ? '' : '#1977cc',
                color: isAdmin ? '' : 'white',
                border: 'none'
            }}
            onClick={() => setIsOpen(!isOpen)}
        >
            <i className={`fas ${isOpen ? 'fa-times' : (isAdmin ? 'fa-comments' : 'fa-comment-dots')}`} style={{ fontSize: '24px' }}></i>
            {((isAdmin && lastUnreadCount > 0) || (!isAdmin && guestUnreadCount > 0)) && !isOpen && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {isAdmin ? lastUnreadCount : guestUnreadCount}
                </span>
            )}
        </button>
    );

    // 2. Guest Chat Window (Small)
    const renderGuestWindow = () => (
        <div ref={chatContainerRef} className="card shadow-lg position-fixed border-0 overflow-hidden"
            style={{ bottom: '90px', right: '20px', width: '320px', height: '450px', zIndex: 1060, borderRadius: '15px', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center p-3">
                <h6 className="mb-0 fw-bold text-white"><i className="fas fa-headset me-2"></i>ติดต่อสอบถาม</h6>
                <button className="btn btn-sm text-white" onClick={() => setIsOpen(false)}><i className="fas fa-minus"></i></button>
            </div>
            <div className="card-body p-3 overflow-auto flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
                {messages.length === 0 && <p className="text-center text-muted mt-4 small">พิมพ์ข้อความทิ้งไว้ได้เลยครับ</p>}
                {messages.map((msg, i) => (
                    <div key={i} className={`d-flex mb-2 ${!msg.IsAdminReply ? 'justify-content-end' : 'justify-content-start'}`}>
                        <div className={`p-2 px-3 rounded-3 shadow-sm position-relative group-hover ${!msg.IsAdminReply ? 'bg-primary text-white' : 'bg-white text-dark border'}`} style={{ maxWidth: '85%' }}>
                            <p className="mb-0 small">{msg.Message}</p>
                            <div className="d-flex justify-content-between align-items-center mt-1" style={{ gap: '5px' }}>
                                <span style={{ fontSize: '10px', opacity: 0.7 }}>
                                    {new Date(msg.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {/* Edit Icon for Guest's own messages */}
                                {!msg.IsAdminReply && (
                                    <i className="fas fa-pen text-white-50 ms-2 cursor-pointer"
                                        style={{ fontSize: '10px', cursor: 'pointer' }}
                                        onClick={() => handleEditClick(msg)}
                                        title="แก้ไข"></i>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="card-footer p-2 bg-white">
                {editingMessage && (
                    <div className="d-flex justify-content-between align-items-center bg-light p-1 mb-1 rounded small px-2">
                        <span className="text-primary truncate">แก้ไข: {editingMessage.Message.substring(0, 15)}...</span>
                        <i className="fas fa-times text-danger cursor-pointer" onClick={cancelEdit}></i>
                    </div>
                )}
                <form onSubmit={sendGuestMessage} className="d-flex gap-2">
                    <input type="text" className="form-control rounded-pill" placeholder={editingMessage ? "แก้ไขข้อความ..." : "พิมพ์ข้อความ..."}
                        value={newMessage} onChange={e => setNewMessage(e.target.value)} />
                    <button type="submit" className={`btn ${editingMessage ? 'btn-success' : 'btn-primary'} rounded-circle`}>
                        <i className={`fas ${editingMessage ? 'fa-check' : 'fa-paper-plane'}`}></i>
                    </button>
                </form>
            </div>
        </div>
    );

    // 3. Admin Chat Window (Large, Dashboard style)
    const renderAdminWindow = () => (
        <div ref={chatContainerRef} className="card shadow-lg position-fixed border-0 overflow-hidden"
            style={{ bottom: '90px', right: '20px', width: '800px', height: '600px', maxHeight: '80vh', zIndex: 1060, borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center p-3">
                <h6 className="mb-0 fw-bold"><i className="fas fa-tools me-2"></i>ระบบตอบแชท (Admin)</h6>
                <button className="btn btn-sm text-dark" onClick={() => setIsOpen(false)}><i className="fas fa-times"></i></button>
            </div>

            {/* Body: Split View */}
            <div className="d-flex flex-grow-1 overflow-hidden" style={{ height: '100%' }}>
                {/* Left: Sessions List */}
                <div className="border-end bg-white" style={{ width: '300px', overflowY: 'auto' }}>
                    {sessions.map(s => (
                        <div key={s.SessionID}
                            className={`p-3 border-bottom cursor-pointer ${selectedSessionId === s.SessionID ? 'bg-light' : ''}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleSessionSelect(s.SessionID)}>
                            <div className="d-flex justify-content-between align-items-center">
                                <strong className="text-truncate flex-grow-1 me-2" title={s.Username || s.SessionID}>
                                    <i className="fas fa-user-circle me-1"></i> {s.Username || s.SessionID.substring(0, 12)}...
                                </strong>
                                <div className="d-flex align-items-center gap-1">
                                    {s.UnreadCount > 0 && <span className="badge bg-danger rounded-pill">{s.UnreadCount}</span>}
                                    <button
                                        className="btn btn-sm btn-link text-danger p-0 ms-1 opacity-50 hover-opacity-100"
                                        onClick={(e) => deleteSession(s.SessionID, e)}
                                        title="ลบแชทนี้ (ลบทั้งสองฝั่ง)"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <small className="text-muted d-block text-truncate">{s.LastMessage}</small>
                            <small className="text-secondary" style={{ fontSize: '10px' }}>
                                {new Date(s.LastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </small>
                        </div>
                    ))}
                    {sessions.length === 0 && <div className="p-4 text-center text-muted">ไม่มีข้อความ</div>}
                </div>

                {/* Right: Chat Pane */}
                <div className="d-flex flex-column flex-grow-1 bg-light">
                    {selectedSessionId ? (
                        <>
                            <div className="p-2 border-bottom bg-white small text-muted">
                                กำลังสนทนากับ: <strong>{sessions.find((s: any) => s.SessionID === selectedSessionId)?.Username || selectedSessionId}</strong>
                            </div>
                            <div className="flex-grow-1 p-3 overflow-auto">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`d-flex mb-2 ${msg.IsAdminReply ? 'justify-content-end' : 'justify-content-start'}`}>
                                        <div className={`p-2 px-3 rounded-3 shadow-sm ${msg.IsAdminReply ? 'bg-warning text-dark' : 'bg-white text-dark border'}`} style={{ maxWidth: '80%' }}>
                                            <p className="mb-0 small">{msg.Message}</p>
                                            <div className="d-flex justify-content-between align-items-center mt-1" style={{ gap: '5px' }}>
                                                <span style={{ fontSize: '10px', opacity: 0.6 }}>
                                                    {new Date(msg.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {/* Edit Icon for Admin's own messages */}
                                                {msg.IsAdminReply && (
                                                    <i className="fas fa-pen text-secondary ms-2 cursor-pointer"
                                                        style={{ fontSize: '10px', cursor: 'pointer' }}
                                                        onClick={() => handleEditClick(msg)}
                                                        title="แก้ไข"></i>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="p-2 bg-white border-top">
                                {editingMessage && (
                                    <div className="d-flex justify-content-between align-items-center bg-light p-1 mb-1 rounded small px-2">
                                        <span className="text-primary truncate">แก้ไข: {editingMessage.Message.substring(0, 15)}...</span>
                                        <i className="fas fa-times text-danger cursor-pointer" onClick={cancelEdit}></i>
                                    </div>
                                )}
                                <form onSubmit={sendAdminReply} className="d-flex gap-2">
                                    <input type="text" className="form-control" placeholder={editingMessage ? "แก้ไขข้อความ..." : "พิมพ์ตอบกลับ..."}
                                        value={adminReply} onChange={e => setAdminReply(e.target.value)} />
                                    <button type="submit" className={`btn ${editingMessage ? 'btn-success' : 'btn-warning'}`}>
                                        <i className={`fas ${editingMessage ? 'fa-check' : 'fa-paper-plane'}`}></i>
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                            <div className="text-center">
                                <i className="fas fa-comments fa-3x mb-3 text-secondary opacity-25"></i>
                                <p>เลือกรายชื่อด้านซ้าย<br />เพื่อเริ่มสนทนา</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {renderButton()}
            {isOpen && (isAdmin ? renderAdminWindow() : renderGuestWindow())}
        </>
    );
};

export default ChatWidget;
