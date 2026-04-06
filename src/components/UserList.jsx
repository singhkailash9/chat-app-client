export default function UserList({ users }) {
  return (
    <div className="px-4 pb-4">
      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
        Online — {users.length}
      </p>
      <div className="space-y-1">
        {users.map((username, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1">
            <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
            <span className="text-gray-300 text-sm truncate">{username}</span>
          </div>
        ))}
      </div>
    </div>
  );
}