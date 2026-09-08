export default function CompanyNavbar() {
  return (
    <header className="bg-white shadow px-8 py-4 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">
          Company Dashboard
        </h1>

        <p className="text-gray-500 text-sm">
          Vulnerability Management Platform
        </p>
      </div>

      <button
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
      >
        Logout
      </button>
    </header>
  );
}