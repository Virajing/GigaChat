import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

const Admin = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedContact, setSelectedContact] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const delayDebounceFn = setTimeout(() => {
                searchMessages();
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [searchQuery]);

    const searchMessages = async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/search/messages?query=${searchQuery}`);
            setMessages(response.data);
            // Deselect others to focus on search results
            setSelectedUser(null);
            setSelectedContact(null);
            setSelectedGroup(null);
        } catch (error) {
            console.error('Error searching messages:', error);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
        } else {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);

            // Check if user is admin
            if (!user.isAdmin) {
                navigate('/main');
            }
        }
    }, [navigate]);

    useEffect(() => {
        if (currentUser && currentUser.isAdmin) {
            fetchAllUsers();
        }
    }, [currentUser]);

    const fetchAllUsers = async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/users`);
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    const viewUserChat = async (userId, contactId) => {
        try {
            const response = await axios.get(`${API_URL}/admin/chat/${userId}/${contactId}`);
            setMessages(response.data);
            setSelectedContact(contactId);
            setSelectedGroup(null);
        } catch (error) {
            console.error('Error fetching chat:', error);
        }
    };

    const viewGroupChat = async (groupId) => {
        try {
            const response = await axios.get(`${API_URL}/admin/group/${groupId}/messages`);
            setMessages(response.data);
            setSelectedGroup(groupId);
            setSelectedContact(null);
        } catch (error) {
            console.error('Error fetching group chat:', error);
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem', color: 'white', backgroundColor: '#1f2937', minHeight: '100vh' }}>Loading...</div>;
    }

    return (
        <div style={{ backgroundColor: '#1f2937', minHeight: '100vh', color: 'white', padding: '2rem' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    marginBottom: '2rem',
                    gap: isMobile ? '1rem' : '0'
                }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Admin Dashboard</h1>
                    <div style={{ display: 'flex', gap: '1rem', width: isMobile ? '100%' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
                        <input
                            type="text"
                            placeholder="Search users & messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '0.25rem',
                                border: 'none',
                                width: isMobile ? '100%' : '300px',
                                backgroundColor: '#374151',
                                color: 'white'
                            }}
                        />
                        <button
                            onClick={() => navigate('/main')}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#374151',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.25rem',
                                cursor: 'pointer',
                                width: isMobile ? '100%' : 'auto'
                            }}
                        >
                            Back to Chat
                        </button>
                    </div>
                </div>

                <div style={{
                    display: isMobile ? 'flex' : 'grid',
                    flexDirection: 'column',
                    gridTemplateColumns: '1fr 1fr 2fr',
                    gap: '1rem'
                }}>
                    {/* Users List */}
                    <div style={{ backgroundColor: '#374151', padding: '1rem', borderRadius: '0.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>All Users ({filteredUsers.length})</h2>
                        {filteredUsers.map(user => (
                            <div
                                key={user._id}
                                onClick={() => setSelectedUser(user)}
                                style={{
                                    padding: '0.75rem',
                                    backgroundColor: selectedUser?._id === user._id ? '#4b5563' : '#1f2937',
                                    borderRadius: '0.25rem',
                                    marginBottom: '0.5rem',
                                    cursor: 'pointer',
                                    border: user.isAdmin ? '2px solid #10b981' : 'none'
                                }}
                            >
                                <div style={{ fontWeight: 'bold' }}>{user.username}</div>
                                <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{user.email}</div>
                                {user.isAdmin && (
                                    <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>ADMIN</div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Contacts & Groups */}
                    <div style={{ backgroundColor: '#374151', padding: '1rem', borderRadius: '0.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
                        {selectedUser ? (
                            <>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{selectedUser.username}'s Data</h2>

                                <h3 style={{ fontSize: '1rem', marginTop: '1rem', marginBottom: '0.5rem', color: '#9ca3af' }}>
                                    Contacts ({selectedUser.contacts?.length || 0})
                                </h3>
                                {selectedUser.contacts?.map(contact => (
                                    <div
                                        key={contact._id}
                                        onClick={() => viewUserChat(selectedUser._id, contact._id)}
                                        style={{
                                            padding: '0.5rem',
                                            backgroundColor: selectedContact === contact._id ? '#4b5563' : '#1f2937',
                                            borderRadius: '0.25rem',
                                            marginBottom: '0.25rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ fontSize: '0.875rem' }}>{contact.username}</div>
                                    </div>
                                ))}

                                <h3 style={{ fontSize: '1rem', marginTop: '1rem', marginBottom: '0.5rem', color: '#9ca3af' }}>
                                    Groups ({selectedUser.groups?.length || 0})
                                </h3>
                                {selectedUser.groups?.map(group => (
                                    <div
                                        key={group._id}
                                        onClick={() => viewGroupChat(group._id)}
                                        style={{
                                            padding: '0.5rem',
                                            backgroundColor: selectedGroup === group._id ? '#4b5563' : '#1f2937',
                                            borderRadius: '0.25rem',
                                            marginBottom: '0.25rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ fontSize: '0.875rem' }}>{group.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{group.members.length} members</div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}>
                                Select a user to view their contacts and groups
                            </div>
                        )}
                    </div>

                    {/* Messages */}
                    <div style={{ backgroundColor: '#374151', padding: '1rem', borderRadius: '0.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
                        {messages.length > 0 ? (
                            <>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                                    {searchQuery ? `Search Results (${messages.length})` : `Chat History (${messages.length} messages)`}
                                </h2>
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: '0.75rem',
                                            backgroundColor: '#1f2937',
                                            borderRadius: '0.25rem',
                                            marginBottom: '0.5rem'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                                                {msg.sender?.username || 'Unknown'}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                                {new Date(msg.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.875rem' }}>{msg.content}</div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}>
                                Select a contact or group to view messages
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
