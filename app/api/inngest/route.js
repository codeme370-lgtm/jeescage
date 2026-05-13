import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { deleteExpiredCoupons, pushAddressChange, pushDeliveryReport } from "@/inngest/functions";

// Create an API that serves available Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    deleteExpiredCoupons,
    pushAddressChange,
    pushDeliveryReport,
  ],
});