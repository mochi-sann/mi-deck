export const Sidebar = () => {
  return (
    <div className="h-full w-64 bg-gray-800 text-white">
      <div className="flex h-16 items-center justify-center border-gray-700 border-b">
        <h1 className="font-bold text-xl">My App</h1>
      </div>
      <nav className="mt-4">
        <ul>
          <li className="cursor-pointer p-4 hover:bg-gray-700">Dashboard</li>
          <li className="cursor-pointer p-4 hover:bg-gray-700">Settings</li>
          <li className="cursor-pointer p-4 hover:bg-gray-700">Profile</li>
        </ul>
      </nav>
    </div>
  );
};
