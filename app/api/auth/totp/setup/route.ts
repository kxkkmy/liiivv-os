import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { authenticator } from "@otplib/preset-default";
import QRCode from "qrcode";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(user.email ?? user.id, "Liiivv OS", secret);
  const qrUrl = await QRCode.toDataURL(otpauth);

  return NextResponse.json({ secret, qrUrl });
}