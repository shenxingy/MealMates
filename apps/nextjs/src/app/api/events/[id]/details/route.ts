import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@mealmates/db";
import { event, eventParticipant } from "@mealmates/db/schema";

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

    const participants = await db.query.eventParticipant.findMany({
      where: eq(eventParticipant.eventId, eventId),
      with: {
        user: true,
      },
    });

    /* eslint-disable @typescript-eslint/no-unnecessary-condition */
    const participantDetails = participants.map((participant) => ({
      id: participant.id,
      userId: participant.userId,
      name: participant.user.name ?? null,
      avatarUrl: participant.user.image ?? null,
      avatarColor: participant.user.avatarColor ?? null,
      successConfirmed: participant.successConfirmed,
    }));

    const allParticipantsConfirmed =
      participantDetails.length > 0 &&
      participantDetails.every((p) => p.successConfirmed);

    // Ensure coordinates are present, using fallback if necessary.
    // We cast to unknown to bypass linter believing restaurantCoordinates is never null (due to schema),
    // protecting against runtime data issues or old records.
    const restaurantCoordinates =
      (foundEvent.restaurantCoordinates as unknown) ?? DEFAULT_RESTAURANT;

    const { user, ...eventData } = foundEvent;

    const responseData = {
      ...eventData,
      status: eventData.status,
      emoji: eventData.emoji,
      hostSuccessConfirmed: eventData.hostSuccessConfirmed,
      participantSuccessConfirmed:
        eventData.participantSuccessConfirmed || allParticipantsConfirmed,
      restaurantCoordinates,
      username: user.name ?? null,
      avatarUrl: user.image ?? null,
      avatarColor: user.avatarColor ?? null,
      participants: participantDetails,
    };
    /* eslint-enable @typescript-eslint/no-unnecessary-condition */

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
