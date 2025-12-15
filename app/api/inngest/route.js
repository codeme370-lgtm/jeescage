import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { deleteExpiredCoupons, syncUserDeletion, syncUserUpdation, synUserCreation } from "@/inngest/functions";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
   //Adding all the users functions here
   synUserCreation,
   syncUserUpdation,
   syncUserDeletion,
   deleteExpiredCoupons
  ],
});