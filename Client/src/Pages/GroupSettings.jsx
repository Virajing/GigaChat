import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

const GroupSettings = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupName, setGroupName] = useState('');
    const [groupPic, setGroupPic] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
        } else {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, [navigate]);

    useEffect(() => {
        if (currentUser) {
            fetchGroup();
            fetchContacts();
        }
    }, [currentUser]);

    const fetchGroup = async () => {
        try {
            const response = await axios.get(`${API_URL}/groups/user/${currentUser.id}`);
            const foundGroup = response.data.find(g => g._id === id);
            if (foundGroup) {
                setGroup(foundGroup);
                setGroupName(foundGroup.name);
                setGroupPic(foundGroup.profilePic || '');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching group:', error);
            setLoading(false);
        }
    };

    const fetchContacts = async () => {
        try {
            const response = await axios.get(`${API_URL}/auth/contacts/${currentUser.id}`);
            setContacts(response.data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    const handleAddMember = async (memberId) => {
        try {
            const response = await axios.put(`${API_URL}/groups/${id}/add-member`, {
                memberId
            });
            setGroup(response.data);
            setMessage('Member added successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error adding member:', error);
            setMessage(error.response?.data?.message || 'Failed to add member');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleUpdateGroup = async () => {
        try {
            const response = await axios.put(`${API_URL}/groups/${id}/update`, {
                name: groupName,
                profilePic: groupPic
            });
            setGroup(response.data);
            setMessage('Group updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error updating group:', error);
            setMessage('Failed to update group');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const generateRandomAvatar = () => {
        const seed = Math.random().toString(36).substring(7);
        setGroupPic(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
    };

    if (loading) {
        return <div style={{ padding: '2rem', color: 'white' }}>Loading...</div>;
    }

    if (!group) {
        return <div style={{ padding: '2rem', color: 'white' }}>Group not found</div>;
    }

    const isAdmin = group.admin === currentUser?.id;
    const availableContacts = contacts.filter(contact =>
        !group.members.some(member => member._id === contact._id)
    );

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#1f2937',
            padding: '2rem',
            color: 'white'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <button
                    onClick={() => navigate('/main')}
                    style={{
                        marginBottom: '1rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#374151',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer'
                    }}
                >
                    ← Back to Chat
                </button>

                <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Group Settings</h1>

                {message && (
                    <div style={{
                        padding: '1rem',
                        marginBottom: '1rem',
                        backgroundColor: message.includes('success') ? '#10b981' : '#ef4444',
                        borderRadius: '0.25rem'
                    }}>
                        {message}
                    </div>
                )}

                {/* Group Info */}
                <div style={{
                    backgroundColor: '#374151',
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    marginBottom: '2rem'
                }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Group Information</h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            fontWeight: 'bold'
                        }}>
                            {groupPic ? (
                                <img src={groupPic} alt="Group" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                group.name[0].toUpperCase()
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                disabled={!isAdmin}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    backgroundColor: '#1f2937',
                                    color: 'white',
                                    border: '1px solid #4b5563',
                                    borderRadius: '0.25rem',
                                    fontSize: '1.25rem'
                                }}
                            />
                        </div>
                    </div>

                    {isAdmin && (
                        <>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    Profile Picture URL
                                </label>
                                <input
                                    type="text"
                                    value={groupPic}
                                    onChange={(e) => setGroupPic(e.target.value)}
                                    placeholder="Enter image URL"
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        backgroundColor: '#1f2937',
                                        color: 'white',
                                        border: '1px solid #4b5563',
                                        borderRadius: '0.25rem'
                                    }}
                                />
                            </div>
                            <button
                                onClick={generateRandomAvatar}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#6366f1',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.25rem',
                                    cursor: 'pointer',
                                    marginRight: '0.5rem'
                                }}
                            >
                                Generate Random Avatar
                            </button>
                            <button
                                onClick={handleUpdateGroup}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.25rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Save Changes
                            </button>
                        </>
                    )}
                </div>

                {/* Members */}
                <div style={{
                    backgroundColor: '#374151',
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    marginBottom: '2rem'
                }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                        Members ({group.members.length})
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {group.members.map(member => (
                            <div key={member._id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.5rem',
                                backgroundColor: '#1f2937',
                                borderRadius: '0.25rem'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: '#6366f1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.25rem'
                                }}>
                                    {member.profilePic ? (
                                        <img src={member.profilePic} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        member.username[0].toUpperCase()
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold' }}>{member.username}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{member.email}</div>
                                </div>
                                {member._id === group.admin && (
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        backgroundColor: '#10b981',
                                        borderRadius: '0.25rem',
                                        fontSize: '0.75rem'
                                    }}>
                                        Admin
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add Members */}
                {isAdmin && availableContacts.length > 0 && (
                    <div style={{
                        backgroundColor: '#374151',
                        padding: '1.5rem',
                        borderRadius: '0.5rem'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Add Members</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {availableContacts.map(contact => (
                                <div key={contact._id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '0.5rem',
                                    backgroundColor: '#1f2937',
                                    borderRadius: '0.25rem'
                                }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        backgroundColor: '#6366f1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.25rem'
                                    }}>
                                        {contact.profilePic ? (
                                            <img src={contact.profilePic} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : (
                                            contact.username[0].toUpperCase()
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 'bold' }}>{contact.username}</div>
                                    </div>
                                    <button
                                        onClick={() => handleAddMember(contact._id)}
                                        style={{
                                            padding: '0.25rem 0.75rem',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '0.25rem',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupSettings;
