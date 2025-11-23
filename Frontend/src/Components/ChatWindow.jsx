import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatWindow = ({ selectedUser, selectedGroup, currentUser, socket, messages, setMessages }) => {
    const [currentMessage, setCurrentMessage] = useState('');
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (currentMessage !== '' && currentUser && (selectedUser || selectedGroup)) {
            const messageData = {
                sender: currentUser.id,
                content: currentMessage,
                timestamp: new Date(),
            };

            if (selectedGroup) {
                messageData.groupId = selectedGroup._id;
                messageData.recipient = null;
            } else {
                messageData.recipient = selectedUser._id;
                messageData.groupId = null;
            }

            await socket.emit('send_message', messageData);
            setCurrentMessage('');
        }
    };

    if (!selectedUser && !selectedGroup) {
        return (
            <div className="empty-state">
                <p>Select a user or group to start chatting</p>
            </div>
        );
    }

    const chatName = selectedGroup ? selectedGroup.name : selectedUser.username;
    const chatAvatar = selectedGroup ? (
        selectedGroup.profilePic ? <img src={selectedGroup.profilePic} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : selectedGroup.name[0].toUpperCase()
    ) : (
        selectedUser.profilePic ? <img src={selectedUser.profilePic} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : selectedUser.username[0].toUpperCase()
    );

    return (
        <div className="chat-window">
            <div className="chat-header">
                <div
                    className="chat-header-user"
                    onClick={() => {
                        if (selectedGroup) {
                            navigate(`/group/${selectedGroup._id}`);
                        } else {
                            navigate(`/profile/${selectedUser._id}`);
                        }
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="avatar avatar-small" style={selectedGroup ? { backgroundColor: '#10b981' } : {}}>
                        {chatAvatar}
                    </div>
                    <h2 className="chat-header-name">{chatName}</h2>
                </div>
            </div>

            <div className="message-list">
                {messages.map((msg, index) => {
                    const isMyMessage = msg.sender._id === currentUser.id || msg.sender === currentUser.id;

                    return (
                        <div
                            key={index}
                            className={`message-wrapper ${isMyMessage ? 'sent' : 'received'}`}
                        >
                            <div className={`message-bubble ${isMyMessage ? 'sent' : 'received'}`}>
                                {!isMyMessage && selectedGroup && (
                                    <p className="message-sender" style={{ fontSize: '0.7rem', color: '#d1d5db' }}>
                                        {msg.sender?.username || 'Unknown'}
                                    </p>
                                )}
                                <p>{msg.content}</p>
                                <span className="message-time">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
                <input
                    type="text"
                    value={currentMessage}
                    onChange={(event) => setCurrentMessage(event.target.value)}
                    onKeyPress={(event) => {
                        event.key === 'Enter' && sendMessage();
                    }}
                    placeholder="Type a message..."
                    className="chat-input"
                />
                <button
                    onClick={sendMessage}
                    className="send-btn"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
