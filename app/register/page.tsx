import Image from "next/image";
import Link from "next/link";

export default function Register() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50">

      <div className="bg-white p-10 rounded-2xl shadow-lg w-[420px]">

        {/* Logo */}
        <div className="text-center mb-6">
          <Image
            src="/chickens.png"
            alt="ELYAN Chicken Hub"
            width={80}
            height={80}
            className="mx-auto mb-2"
          />

          <h1 className="text-2xl font-bold text-orange-500">
            Create Account
          </h1>

          <p className="text-gray-500 text-sm">
            Join ELYAN Chicken Hub
          </p>
        </div>

        {/* Register Form */}
        <form className="space-y-4">

          <div>
            <label className="text-sm font-medium text-gray-600">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your name"
              className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
            />
          </div>

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
              placeholder="Create password"
              className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm password"
              className="border border-gray-300 p-2 w-full rounded-lg focus:outline-none focus:border-orange-500"
            />
          </div>

          <button
            className="bg-orange-500 hover:bg-orange-600 text-white w-full py-2 rounded-lg font-semibold transition"
          >
            Register
          </button>

        </form>

        {/* Login Link */}
        <div className="text-center mt-4 text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-orange-500 font-semibold">
            Login
          </Link>
        </div>

      </div>

    </div>
  );
}