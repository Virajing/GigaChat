import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';
import ChatWindow from '../Components/ChatWindow';
import '../Stylesheets/Chat.css';
import { API_URL, SOCKET_URL } from '../config';

const socket = io(SOCKET_URL);

const Main = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);

      // Join private room
      socket.emit('join_room', user.id);
    }
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      console.log('CurrentUser set:', currentUser);
      // Fetch contacts
      const fetchContacts = async () => {
        try {
          const response = await axios.get(`${API_URL}/auth/contacts/${currentUser.id}`);
          setUsers(response.data);
        } catch (error) {
          console.error('Error fetching contacts:', error);
        }
      };

      // Fetch groups
      const fetchGroups = async () => {
        try {
          const response = await axios.get(`${API_URL}/groups/user/${currentUser.id}`);
          setGroups(response.data);
          // Join group rooms
          response.data.forEach(group => {
            socket.emit('join_room', group._id);
          });
        } catch (error) {
          console.error('Error fetching groups:', error);
        }
      };

      fetchContacts();
      fetchGroups();
    }
  }, [currentUser]);

  const handleSearchUsers = async (query) => {
    if (!query) return [];
    try {
      const response = await axios.get(`${API_URL}/auth/search?username=${query}`);
      const filtered = response.data.filter(u =>
        u._id !== currentUser.id &&
        !users.some(c => c._id === u._id)
      );
      return filtered;
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  };

  const handleAddContact = async (contactId) => {
    try {
      const response = await axios.post(`${API_URL}/auth/add-contact`, {
        userId: currentUser.id,
        contactId
      });
      setUsers(prev => [...prev, response.data.contact]);
    } catch (error) {
      console.error("Add contact error:", error);
    }
  };

  const handleCreateGroup = async (name, members) => {
    try {
      const response = await axios.post(`${API_URL}/groups/create`, {
        name,
        members,
        admin: currentUser.id
      });
      const newGroup = response.data;
      setGroups(prev => [newGroup, ...prev]);
      socket.emit('join_room', newGroup._id);
    } catch (error) {
      console.error("Create group error:", error);
    }
  };

  useEffect(() => {
    if (currentUser && (selectedUser || selectedGroup)) {
      const fetchHistory = async () => {
        try {
          if (selectedGroup) {
            const response = await axios.get(`${API_URL}/chat/group-history/${selectedGroup._id}`);
            setMessages(response.data);
          } else {
            const response = await axios.get(`${API_URL}/chat/history/${currentUser.id}/${selectedUser._id}`);
            setMessages(response.data);
          }
        } catch (error) {
          console.error('Error fetching history:', error);
        }
      };
      fetchHistory();
    }
  }, [currentUser, selectedUser, selectedGroup]);

  useEffect(() => {
    socket.on('receive_message', (message) => {
      console.log('Received message:', message);

      const messageSenderId = message.sender?._id || message.sender;
      const messageRecipient = message.recipient;

      if (selectedGroup && message.groupId === selectedGroup._id) {
        setMessages(prev => [...prev, message]);
      } else if (
        selectedUser &&
        !message.groupId &&
        ((messageSenderId === selectedUser._id && messageRecipient === currentUser.id) ||
          (messageSenderId === currentUser.id && messageRecipient === selectedUser._id))
      ) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => {
      socket.off('receive_message');
    };
  }, [currentUser, selectedUser, selectedGroup]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSelectedGroup(null);
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setSelectedUser(null);
  };

  return (
    <div className="chat-container">
      <Sidebar
        users={users}
        groups={groups}
        selectedUser={selectedUser}
        selectedGroup={selectedGroup}
        onSelectUser={handleSelectUser}
        onSelectGroup={handleSelectGroup}
        currentUser={currentUser}
        onSearch={handleSearchUsers}
        onAddContact={handleAddContact}
        onCreateGroup={handleCreateGroup}
      />
      <ChatWindow
        selectedUser={selectedUser}
        selectedGroup={selectedGroup}
        currentUser={currentUser}
        socket={socket}
        messages={messages}
        setMessages={setMessages}
      />
    </div>
  );
};

export default Main;
