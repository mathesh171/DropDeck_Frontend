import React from "react";

const ChatSidebar = ({ groups, onLogout, onSelectGroup, selectedGroup }) => (
  <div className="sidebar" style={{width: 250, background: "#f5f5f5", padding: 16, borderRight: "1px solid #ddd", minHeight: "100vh"}}>
    <button onClick={onLogout} style={{marginBottom: 16, width: "100%"}}>Logout</button>
    <h3>Groups</h3>
    <ul style={{listStyle: "none", padding: 0}}>
      {groups.map(group => (
        <li
          key={group.id}
          style={{
            padding: "8px 12px",
            cursor: "pointer",
            background: selectedGroup?.id === group.id ? "#ececec" : "transparent"
          }}
          onClick={() => onSelectGroup(group)}
        >
          {group.name}
        </li>
      ))}
    </ul>
  </div>
);

export default ChatSidebar;
