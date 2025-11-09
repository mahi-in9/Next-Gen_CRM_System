import { Link } from "react-router-dom";
import { Home } from "lucide-react"; // modern minimal icon set (lucide-react)
import React from "react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <h1 className="text-[6rem] font-extrabold text-gray-800 dark:text-white tracking-tight leading-none">
        404
      </h1>

      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mt-2">
        Page Not Found
      </h2>

      <p className="text-gray-500 dark:text-gray-400 mt-3 text-center max-w-md">
        The page you’re looking for doesn’t exist or has been moved. Check the
        URL or navigate back to a valid section of the CRM system.
      </p>

      <div className="flex gap-3 mt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          <Home size={18} />
          Go Home
        </Link>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
