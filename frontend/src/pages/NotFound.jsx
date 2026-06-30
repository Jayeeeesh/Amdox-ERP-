import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-8xl font-bold text-gray-800">404</h1>

      <h2 className="mt-4 text-2xl font-semibold text-gray-700">
        Oops! Page Not Found
      </h2>

      <p className="mt-2 max-w-md text-gray-500">
        The page you are looking for doesn't exist or may have been moved.
      </p>

      <Link
        to="/dashboard"
        className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
      >
        Go to Dashboard
      </Link>
    </main>
  );
};

export default NotFound;