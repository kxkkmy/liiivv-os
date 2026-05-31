import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authenticator } from "@otplib/preset-default";

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("totp_secret")
    .eq("id", user.id)
    .single();

  if (!profile?.totp_secret) {
    return NextResponse.json({ error: "TOTP not configured" }, { status: 400 });
  }

  const isValid = authenticator.verify({
    token,
    secret: profile.totp_secret,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}