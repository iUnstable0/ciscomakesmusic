import axios from "axios";
import { validateTurnstileToken } from "next-turnstile";

import * as z from "zod";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, phone, name, iceCream, token } = body;

  let parsedEmail;

  try {
    parsedEmail = z.email().parse(email);
  } catch (e) {
    return new Response(JSON.stringify({ message: "Invalid email address" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let tokenResult;

  try {
    tokenResult = await validateTurnstileToken({
      token,
      secretKey: process.env.TURNSTILE_SECRET_KEY!,
    });
  } catch (error) {
    console.error("Validation failed:", error);
  }

  if (!tokenResult || !tokenResult.success) {
    return new Response(
      JSON.stringify({ message: "Captcha validation failed" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return axios
    .request({
      method: "POST",
      url: process.env.DISCORD_WEBHOOK_URL!,
      headers: { "Content-Type": "application/json" },
      data: {
        content: `New subscription: ${parsedEmail}\nName: ${name}\nPhone: ${phone}\nFavorite Ice Cream: ${iceCream}`,
      },
    })
    .then(() => {
      return new Response(JSON.stringify({ message: "Subscription added" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    })
    .catch((error) => {
      console.error("Error adding subscription:", error);

      return new Response(
        JSON.stringify({ message: "Failed to add subscription" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    });
}
