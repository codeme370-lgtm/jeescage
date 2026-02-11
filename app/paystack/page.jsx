"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Suspense } from "react";

function PaystackPageContent() {
  const search = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reference = search.get("reference");
    if (!reference) {
      setLoading(false);
      return;
    }

    // verify on the server and then redirect to orders
    (async () => {
      try {
        const { data } = await axios.post("/api/paystack/verify", { reference });
        if (data?.ok) {
          toast.success("Payment verified. Processing order...");
        } else {
          toast.error("Payment could not be verified");
        }
      } catch (err) {
        toast.error(err?.response?.data?.error || "Verification failed");
      } finally {
        setLoading(false);
        router.push("/orders");
      }
    })();
  }, [search]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {loading ? (
          <div>
            <p className="text-lg">Finalizing payment...</p>
            <p className="text-sm text-slate-500">You will be redirected shortly</p>
          </div>
        ) : (
          <div>
            <p className="text-lg">No payment reference found.</p>
            <p className="text-sm text-slate-500">Please check your orders page.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaystackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaystackPageContent />
    </Suspense>
  );
}
