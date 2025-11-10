import { NextResponse } from "next/server";

import { detailedEventMockData } from "~/app/mock/mock";

export function GET(_request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  const eventId = Number(id);
  const event = detailedEventMockData.find((e) => e.id === eventId);

  if (!event) {
    return NextResponse.json(
      { data: null, message: "Event not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    data: event,
    message: "Success",
  });
}
