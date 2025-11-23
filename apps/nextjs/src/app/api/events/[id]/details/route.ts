import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@mealmates/db";
import { event } from "@mealmates/db/schema";

// Hardcoded coordinates from mock data (as fallback)
const DEFAULT_RESTAURANT = { latitude: 36.01126, longitude: -78.92182 };

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const eventId = Number(id);

  if (isNaN(eventId)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    const foundEvent = await db.query.event.findFirst({
      where: eq(event.id, eventId),
      with: {
        user: true,
      },
    });

    if (!foundEvent) {
      return NextResponse.json(
        { data: null, message: "Event not found" },
        { status: 404 },
      );
    }

    // Ensure coordinates are present, using fallback if necessary.
    // We cast to unknown to bypass linter believing restaurantCoordinates is never null (due to schema),
    // protecting against runtime data issues or old records.
    const restaurantCoordinates =
      (foundEvent.restaurantCoordinates as unknown) ?? DEFAULT_RESTAURANT;

    const { user, ...eventData } = foundEvent;

    const responseData = {
      ...eventData,
      restaurantCoordinates,
      username: user.name as unknown as string | null,
      avatarUrl: user.image as unknown as string | null,
      avatarColor: user.avatarColor as unknown as string | null,
    };

    return NextResponse.json({
      data: responseData,
      message: "Success",
    });
  } catch (error) {
    console.error("Error fetching event details:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
