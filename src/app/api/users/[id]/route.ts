
import { NextResponse } from "next/server";
import { getUserById } from "@/lib/data";

export const revalidate = 0;

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUserById(params.id);
    if (!user) {
        return NextResponse.json(null, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
