import { Request, Response } from "express";
import { verifyWebhook } from "@clerk/express/webhooks";
import { User } from "../models/user.js";

const clerkWebhooks = async (req: Request, res: Response) => {
  try {
    const evt: any = await verifyWebhook(req);
    // Getting data from request
    const { data, type } = evt;

    // Cases from different events
    switch (type) {
      case "user.created": {
        const newUser = new User({
          id: data.id,
          email: data?.email_addresses[0]?.email_address,
          name: (data?.first_name || "") + " " + (data?.last_name || ""),
          image: data?.image_url || "",
        });
        await newUser.save();
        break;
      }

      case "user.updated": {
        await User.findOneAndUpdate(
          { id: data.id },
          {
            email: data?.email_addresses[0]?.email_address,
            name: (data?.first_name || "") + " " + (data?.last_name || ""),
            image: data?.image_url || "",
          },
          { upsert: true }
        );
        break;
      }

      case "user.deleted": {
        await User.deleteOne({ id: data.id });
        break;
      }

      case "paymentAttempt.updated": {
        if (
          (data.charge_type === "recurring" ||
            data.charge_type === "checkout") &&
          data.status === "paid"
        ) {
          const credits = { pro: 80, premium: 240 };
          const clerkUserId = data?.payer?.user_id;
          const planId: keyof typeof credits =
            data?.subscription_item?.[0]?.plan?.slug;

          if (planId !== "pro" && planId !== "premium") {
            return res.status(400).json({
              message: "Invalid plan",
            });
          }

          console.log(planId);

          await User.findOneAndUpdate(
            { id: clerkUserId },
            { $inc: { credits: credits[planId] } },
            { new: true }
          );
        }
        break;
      }

      default:
        break;
    }

    res.json({ message: "Webhook Received: " + type });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export default clerkWebhooks;
