import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ users, groups, selectedUser, selectedGroup, onSelectUser, onSelectGroup, currentUser, onSearch, onAddContact, onCreateGroup }) => {
    const navigate = useNavigate();
    const [isSearching, setIsSearching] = useState(false);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 0) {
            const results = await onSearch(query);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const addContact = async (user) => {
        await onAddContact(user._id);
        setSearchQuery('');
        setSearchResults([]);
        setIsSearching(false);
    };

    const handleCreateGroup = async () => {
        if (!groupName || selectedGroupMembers.length === 0) return;
        await onCreateGroup(groupName, selectedGroupMembers);
        setGroupName('');
        setSelectedGroupMembers([]);
        setIsCreatingGroup(false);
    };

    const toggleGroupMember = (userId) => {
        if (selectedGroupMembers.includes(userId)) {
            setSelectedGroupMembers(prev => prev.filter(id => id !== userId));
        } else {
            setSelectedGroupMembers(prev => [...prev, userId]);
        }
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="sidebar-title">Chats</h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => { setIsSearching(!isSearching); setIsCreatingGroup(false); }}
                            style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '1.25rem', fontWeight: 'bold' }}
                            title="Add Contact"
                        >
                            +
                        </button>
                        <button
                            onClick={() => { setIsCreatingGroup(!isCreatingGroup); setIsSearching(false); }}
                            style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '1.25rem', fontWeight: 'bold' }}
                            title="Create Group"
                        >
                            G
                        </button>
                        <button
                            onClick={() => navigate('/profile')}
                            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                            Profile
                        </button>
                    </div>
                </div>
                <p className="sidebar-subtitle">Logged in as: {currentUser?.username}</p>

                {isSearching && (
                    <div style={{ marginTop: '0.5rem' }}>
                        <input
                            type="text"
                            placeholder="Search username..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="chat-input"
                            style={{ width: '100%', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        />
                    </div>
                )}

                {isCreatingGroup && (
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#374151', borderRadius: '0.25rem' }}>
                        <input
                            type="text"
                            placeholder="Group Name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="chat-input"
                            style={{ width: '100%', marginBottom: '0.5rem' }}
                        />
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Select Members:</p>
                        <div style={{ maxHeight: '100px', overflowY: 'auto', marginBottom: '0.5rem' }}>
                            {users.map(user => (
                                <div key={user._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedGroupMembers.includes(user._id)}
                                        onChange={() => toggleGroupMember(user._id)}
                                    />
                                    <span style={{ fontSize: '0.875rem', color: 'white' }}>{user.username}</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleCreateGroup} className="send-btn" style={{ width: '100%', padding: '0.25rem' }}>Create</button>
                    </div>
                )}
            </div>

            <div className="user-list">
                {isSearching && searchQuery ? (
                    searchResults.length > 0 ? (
                        searchResults.map((user) => (
                            <div key={user._id} className="user-item" style={{ cursor: 'default' }}>
                                <div className="user-item-content">
                                    <div className="avatar">
                                        {user.profilePic ? <img src={user.profilePic} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : user.username[0].toUpperCase()}
                                    </div>
                                    <div className="user-info" style={{ flex: 1 }}>
                                        <p className="user-name">{user.username}</p>
                                    </div>
                                    <button onClick={() => addContact(user)} className="send-btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Add</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '1rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>No users found</div>
                    )
                ) : (
                    <>
                        {/* Groups Section */}
                        {groups && groups.length > 0 && (
                            <>
                                <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 'bold' }}>GROUPS</div>
                                {groups.map((group) => (
                                    <div
                                        key={group._id}
                                        onClick={() => onSelectGroup(group)}
                                        className={`user-item ${selectedGroup?._id === group._id ? 'active' : ''}`}
                                    >
                                        <div className="user-item-content">
                                            <div className="avatar" style={{ backgroundColor: '#10b981' }}>
                                                {group.name[0].toUpperCase()}
                                            </div>
                                            <div className="user-info">
                                                <p className="user-name">{group.name}</p>
                                                <p className="user-email">{group.members.length} members</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        {/* Contacts Section */}
                        <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 'bold' }}>CONTACTS</div>
                        {users.map((user) => (
                            <div
                                key={user._id}
                                onClick={() => onSelectUser(user)}
                                className={`user-item ${selectedUser?._id === user._id ? 'active' : ''}`}
                            >
                                <div className="user-item-content">
                                    <div className="avatar">
                                        {user.profilePic ? <img src={user.profilePic} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : user.username[0].toUpperCase()}
                                    </div>
                                    <div className="user-info">
                                        <p className="user-name">{user.username}</p>
                                        <p className="user-email">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
