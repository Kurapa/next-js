// src/app/unauthorized/page.tsx
export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="text-gray-700 mb-6">You do not have permission to view this page.</p>
      <a
        href="/"
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
      >
        Go Home
      </a>
    </div>
  );
}
