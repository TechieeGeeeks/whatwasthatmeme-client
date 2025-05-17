import { useAuth } from "./auth-context";
import Image from "next/image";
import React, { useState } from "react";

const NotLoggedIn: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState<string>("");

  const handleLogin = async (): Promise<void> => {
    try {
      setError("");
      await signInWithGoogle();
    } catch (error) {
      setError("Failed to log in");
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto p-4 md:p-8 grid place-items-center">
      <div className="bg-white p-8 rounded-lg border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] max-w-md w-full">
        <Image
          src="/login.svg"
          width={300}
          height={300}
          alt="Login illustration"
          className="mx-auto mb-6"
        />
        {error && (
          <p className="text-red-600 font-bold mb-4 text-center">{error}</p>
        )} 
        <p className="text-xl font-bold mb-6 text-center">
          Hey Bud! We know it&apos;s annoying, but trust me it&apos;s one time only.
        </p>
        <button  
          onClick={handleLogin}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
        >
          Login With Google
        </button>
      </div>
    </div>
  );
};

export default NotLoggedIn;