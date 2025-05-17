import { useAuth } from "./auth-context";
import Image from "next/image";
import React, { useState, useEffect } from "react";

const NotLoggedIn: React.FC = () => {
  const { signInWithGoogle, error: authError } = useAuth();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (authError) {
      setError(authError);
      setIsLoading(false);
    }
  }, [authError]);

  const handleLogin = async (): Promise<void> => {
    try {
      if (isLoading) return;

      setError("");
      setIsLoading(true);

      const user = await signInWithGoogle();

      if (!user) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto p-4 md:p-8 grid place-items-center">
      <div className="bg-white p-8 border-4 border-black shadow-shadow max-w-md w-full">
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
          Hey Bud! We know it&apos;s annoying, but trust me it&apos;s one time
          only.
        </p>
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className={`w-full bg-[#3300FF] hover:bg-[#3300FF]/90 text-white font-bold py-3 px-6 border border-black cursor-pointer shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Logging in..." : "Login With Google"}
        </button>
      </div>
    </div>
  );
};

export default NotLoggedIn;
