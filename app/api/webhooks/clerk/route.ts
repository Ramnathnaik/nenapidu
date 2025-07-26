import { createUser, updateUser } from "@/app/utils/userHelpers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.text();

  // Get the Webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  // Handle the webhook
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with an ID of ${id} and type of ${eventType}`);

  // Handle user.created event
  if (eventType === "user.created") {
    const {
      id: userId,
      email_addresses,
      first_name,
      last_name,
      phone_numbers,
    } = evt.data;

    // Extract the primary email
    const primaryEmail = email_addresses.find(
      (email) => email.id === evt.data.primary_email_address_id
    );

    // Extract the primary phone number
    const primaryPhone = phone_numbers.find(
      (phone) => phone.id === evt.data.primary_phone_number_id
    );

    // Construct the full name
    const name = `${first_name || ""} ${last_name || ""}`.trim() || null;

    try {
      // Create user using helper function
      const newUser = await createUser({
        userId: userId,
        email: primaryEmail?.email_address || "",
        name: name || "",
        phoneNumber: primaryPhone?.phone_number || null,
      });

      if (!newUser) {
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "User created successfully",
        user: newUser,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }
  }

  // Handle user.updated event (optional - in case user updates their profile)
  if (eventType === "user.updated") {
    const {
      id: userId,
      email_addresses,
      first_name,
      last_name,
      phone_numbers,
    } = evt.data;

    // Extract the primary email
    const primaryEmail = email_addresses.find(
      (email) => email.id === evt.data.primary_email_address_id
    );

    // Extract the primary phone number
    const primaryPhone = phone_numbers.find(
      (phone) => phone.id === evt.data.primary_phone_number_id
    );

    // Construct the full name
    const name = `${first_name || ""} ${last_name || ""}`.trim() || null;

    try {
      // Update the user using helper function
      const updatedUser = await updateUser(userId, {
        email: primaryEmail?.email_address || "",
        name: name || "",
        phoneNumber: primaryPhone?.phone_number || null,
      });

      if (!updatedUser) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }
  }

  return new Response("", { status: 200 });
}
