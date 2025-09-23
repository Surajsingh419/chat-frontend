// frontend/src/components/UserList.js
'use client'

export default function UserList({ onlineUsers = [], currentUser }) {
  return (
    <div className="w-80 bg-gray-800 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-semibold">Online Users</h2>
        <p className="text-gray-400 text-sm mt-1">{onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} online</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4 space-y-2">
          {onlineUsers.map((user) => (
            <div
              key={user.id}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                user.id === currentUser?.id 
                  ? 'bg-blue-600' 
                  : 'hover:bg-gray-700'
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-semibold text-white">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-800 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {user.username}
                  {user.id === currentUser?.id && ' (You)'}
                </p>
                <p className="text-sm text-gray-400 truncate">Online</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-semibold text-white">
            {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{currentUser?.username || 'Unknown User'}</p>
            <p className="text-sm text-green-400">Online</p>
          </div>
        </div>
      </div>
    </div>
  )
}



