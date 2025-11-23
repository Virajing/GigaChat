import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../Stylesheets/Chat.css';
import { API_URL } from '../config';

const Profile = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [profilePic, setProfilePic] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isReadOnly, setIsReadOnly] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }

        const currentUser = JSON.parse(storedUser);
        const targetUserId = id || currentUser.id || currentUser._id;
        const isSelf = targetUserId === (currentUser.id || currentUser._id);

        setIsReadOnly(!isSelf);

        const fetchProfile = async () => {
            try {
                if (isSelf) {
                    setUser(currentUser);
                    setName(currentUser.name || '');
                    setBio(currentUser.bio || '');
                    setProfilePic(currentUser.profilePic || '');
                } else {
                    const response = await axios.get(`${API_URL}/auth/profile/${targetUserId}`);
                    const fetchedUser = response.data;
                    setUser(fetchedUser);
                    setName(fetchedUser.name || '');
                    setBio(fetchedUser.bio || '');
                    setProfilePic(fetchedUser.profilePic || '');
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                setMessage('Failed to load profile.');
            }
        };

        fetchProfile();
    }, [navigate, id]);

    const handleSave = async () => {
        if (isReadOnly) return;

        setLoading(true);
        setMessage('');
        try {
            const response = await axios.put(`${API_URL}/auth/update/${user.id || user._id}`, {
                name,
                bio,
                profilePic,
            });

            const updatedUser = { ...user, ...response.data.user };
            updatedUser.id = updatedUser._id;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            setMessage('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const generateRandomAvatar = () => {
        if (isReadOnly) return;
        const randomSeed = Math.random().toString(36).substring(7);
        const randomAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;
        setProfilePic(randomAvatarUrl);
    };

    if (!user) return <div className="chat-container"><div className="empty-state">Loading...</div></div>;

    const displayChar = user.username ? user.username[0].toUpperCase() : '?';

    return (
        <div className="chat-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div className="profile-card" style={{
                backgroundColor: '#1E1E1E',
                padding: '2rem',
                borderRadius: '0.5rem',
                width: '100%',
                maxWidth: '500px',
                color: '#E0E0E0',
                border: '1px solid #333'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center', color: '#FFC107' }}>
                    {isReadOnly ? 'User Profile' : 'Edit Profile'}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div className="avatar" style={{ width: '6rem', height: '6rem', fontSize: '2rem', marginBottom: '1rem', backgroundColor: '#FFC107', color: '#121212' }}>
                        {profilePic ? (
                            <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            displayChar
                        )}
                    </div>
                    {!isReadOnly && (
                        <button
                            onClick={generateRandomAvatar}
                            className="send-btn"
                            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', backgroundColor: '#333', color: '#E0E0E0', border: '1px solid #555' }}
                        >
                            Generate Random Avatar
                        </button>
                    )}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#9E9E9E' }}>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="chat-input"
                        style={{ width: '100%', backgroundColor: '#333', color: '#E0E0E0', border: '1px solid #444' }}
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#9E9E9E' }}>Bio</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="chat-input"
                        style={{ width: '100%', minHeight: '80px', resize: 'vertical', backgroundColor: '#333', color: '#E0E0E0', border: '1px solid #444' }}
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
                    />
                </div>

                {!isReadOnly && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#9E9E9E' }}>Profile Picture URL (Optional)</label>
                        <input
                            type="text"
                            value={profilePic}
                            onChange={(e) => setProfilePic(e.target.value)}
                            className="chat-input"
                            style={{ width: '100%', backgroundColor: '#333', color: '#E0E0E0', border: '1px solid #444' }}
                            placeholder="https://example.com/image.png"
                        />
                    </div>
                )}

                {message && (
                    <p style={{
                        color: message.includes('success') ? '#10b981' : '#ef4444',
                        marginBottom: '1rem',
                        textAlign: 'center'
                    }}>
                        {message}
                    </p>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/main')}
                        className="logout-btn"
                        style={{ flex: 1, backgroundColor: '#333', textAlign: 'center', color: '#E0E0E0', border: '1px solid #555' }}
                    >
                        Back to Chat
                    </button>
                    {!isReadOnly && (
                        <>
                            <button
                                onClick={handleSave}
                                className="send-btn"
                                style={{ flex: 1, textAlign: 'center', backgroundColor: '#FFC107', color: '#121212' }}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('user');
                                    navigate('/login');
                                }}
                                className="logout-btn"
                                style={{ flex: 1, backgroundColor: '#ef4444', textAlign: 'center' }}
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
