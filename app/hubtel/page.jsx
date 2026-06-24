"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Suspense } from "react";

function HubtelPageContent() {
  const search = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reference = search.get("reference") || search.get("transactionId") || search.get("id");
    if (!reference) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data } = await axios.post("/api/hubtel/verify", { reference });
        if (data?.ok) {
          toast.success("Hubtel payment verified. Processing order...");
        } else {
          toast.error("Hubtel payment could not be verified");
        }
      } catch (err) {
        toast.error(err?.response?.data?.error || "Hubtel verification failed");
      } finally {
        setLoading(false);
        router.push("/orders");
      }
    })();
  }, [search, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {loading ? (
          <div>
            <p className="text-lg">Finalizing Hubtel payment...</p>
            <p className="text-sm text-slate-500">You will be redirected shortly</p>
          </div>
        ) : (
          <div>
            <p className="text-lg">No Hubtel payment reference found.</p>
            <p className="text-sm text-slate-500">Please check your orders page.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HubtelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HubtelPageContent />
    </Suspense>
  );
}
