"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck } from "lucide-react";

type Props = {
  userId: string;
  totpEnabled: boolean;
};

export function TotpSetup({ userId, totpEnabled }: Props) {
  const [step, setStep] = useState<"idle" | "setup" | "verify">("idle");
  const [qrUrl, setQrUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSetup() {
    setLoading(true);
    const res = await fetch("/api/auth/totp/setup", { method: "POST" });
    const data = await res.json();
    setQrUrl(data.qrUrl);
    setSecret(data.secret);
    setStep("setup");
    setLoading(false);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/totp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, secret }),
    });

    if (!res.ok) {
      setError("認証コードが正しくありません");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setStep("idle");
    setLoading(false);
  }

  async function handleDisable() {
    if (!confirm("2段階認証を無効にしますか？")) return;
    setLoading(true);

    const res = await fetch("/api/auth/totp/disable", { method: "POST" });
    if (res.ok) {
      window.location.reload();
    }
    setLoading(false);
  }

  if (step === "setup") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">1. Google Authenticatorをインストール</p>
          <p className="text-sm text-muted-foreground">App StoreまたはGoogle PlayからGoogle Authenticatorをダウンロードしてください。</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">2. QRコードをスキャン</p>
          {qrUrl && (
            <div className="border rounded-lg p-4 inline-block bg-white">
              <img src={qrUrl} alt="QR Code" width={160} height={160} />
            </div>
          )}
          <p className="text-xs text-muted-foreground">QRコードが読めない場合はこのコードを手動入力：</p>
          <code className="text-xs bg-muted px-2 py-1 rounded">{secret}</code>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">3. 認証コードを入力して確認</p>
          <form onSubmit={handleVerify} className="flex gap-2">
            <Input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="000000"
              maxLength={6}
              inputMode="numeric"
              className="w-32"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "確認中..." : "有効にする"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setStep("idle")}>
              キャンセル
            </Button>
          </form>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {totpEnabled || success ? (
          <ShieldCheck size={20} className="text-green-500" />
        ) : (
          <Shield size={20} className="text-muted-foreground" />
        )}
        <div>
          <p className="text-sm font-medium">2段階認証</p>
          <p className="text-xs text-muted-foreground">Google Authenticatorを使用</p>
        </div>
        <Badge variant={totpEnabled || success ? "default" : "outline"} className="text-xs">
          {totpEnabled || success ? "有効" : "無効"}
        </Badge>
      </div>
      {totpEnabled || success ? (
        <Button size="sm" variant="outline" onClick={handleDisable} disabled={loading}>
          無効にする
        </Button>
      ) : (
        <Button size="sm" onClick={handleSetup} disabled={loading}>
          {loading ? "準備中..." : "設定する"}
        </Button>
      )}
    </div>
  );
}