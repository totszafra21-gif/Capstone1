import Image from "next/image";
import Link from "next/link";

export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50">

      <div className="bg-white p-10 rounded-2xl shadow-lg w-[400px]">

        {/* Logo / Title */}
        <div className="text-center mb-6">
          <Image
            src="/chickens.png"
            alt="ELYAN Chicken Hub"
            width={80}
            height={80}
            className="mx-auto mb-2"
          />

          <h1 className="text-2xl font-bold text-orange-500">
            ELYAN Chicken Hub
          </h1>

          <p className="text-gray-500 text-sm">
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <form className="space-y-4">

          <div>
            <label className="text-sm font-medium text-gray-600">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
            />
          </div>

          <button
            className="bg-orange-500 hover:bg-orange-600 text-white w-full py-2 rounded-lg font-semibold transition"
          >
            Login
          </button>

        </form>

        {/* Extra Links */}
        <div className="text-center mt-4 text-sm text-gray-500">
          Don't have an account?{" "}
          <Link href="/register" className="text-orange-500 font-semibold">
            Register
          </Link>
        </div>

      </div>

    </div>
  );
}