import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { authenticator } from "@otplib/preset-default";

export async function POST(req: NextRequest) {
  const { token, secret } = await req.json();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isValid = authenticator.verify({ token, secret });
  if (!isValid) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { error } = await supabase
    .from("profiles")
    .update({ totp_secret: secret, totp_enabled: true })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}