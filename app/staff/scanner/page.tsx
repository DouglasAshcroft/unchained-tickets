"use client";

import { useState } from "react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { QRScanner } from "@/components/ui/QRScanner";

interface Perk {
  id: number;
  name: string;
  quantity: number;
  redeemedQuantity: number;
  remainingQuantity: number;
  description?: string | null;
  instructions?: string | null;
}

interface ScannedTicket {
  id: string;
  eventName: string;
  venueName: string;
  tierName?: string;
  seatInfo?: string;
  walletAddress: string;
  perks?: Perk[];
}

export default function StaffScannerPage() {
  const [qrInput, setQrInput] = useState("");
  const [scannedTicket, setScannedTicket] = useState<ScannedTicket | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<"camera" | "manual">("camera");

  const processQRCode = async (qrCode: string) => {
    setLoading(true);
    setError(null);

    try {
      // Parse QR code: UNCHAINED-TICKET:eventId:purchaseId:index:txHash
      const parts = qrCode.split(":");
      if (parts.length < 4 || parts[0] !== "UNCHAINED-TICKET") {
        throw new Error("Invalid QR code format");
      }

      const ticketId = `${parts[2]}-${parts[3]}`;

      // Validate ticket
      const response = await fetch(
        `/api/tickets/validate?ticketId=${ticketId}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to validate ticket");
      }

      const data = await response.json();

      if (!data.valid) {
        throw new Error(data.error || "Invalid ticket");
      }

      setScannedTicket({
        id: ticketId,
        eventName: data.ticket.eventName,
        venueName: data.ticket.venueName,
        tierName:
          data.ticket.tierName || data.ticket.seatInfo || "General Admission",
        seatInfo: data.ticket.seatInfo,
        walletAddress: "0x..." + qrCode.slice(-8), // Mock wallet from QR
        perks: (data.ticket.perks || []).map((perk: any) => ({
          id: perk.id,
          name: perk.name,
          quantity: perk.quantity,
          redeemedQuantity: perk.redeemedQuantity,
          remainingQuantity: perk.remainingQuantity,
          description: perk.description,
          instructions: perk.instructions,
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan ticket");
      setScannedTicket(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCameraScan = (decodedText: string) => {
    setQrInput(decodedText);
    processQRCode(decodedText);
  };

  const handleManualScan = async () => {
    if (!qrInput.trim()) {
      setError("Please enter a QR code");
      return;
    }
    processQRCode(qrInput);
  };

  const handleRedeemPerk = async (ticketPerkId: number) => {
    if (!scannedTicket) return;

    const perk = scannedTicket.perks?.find((item) => item.id === ticketPerkId);
    if (!perk) return;

    if (perk.remainingQuantity <= 0) {
      alert("This perk has already been fully redeemed.");
      return;
    }

    try {
      // In production, this would call the smart contract via API
      const response = await fetch("/api/perks/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: scannedTicket.id,
          walletAddress: scannedTicket.walletAddress,
          ticketPerkId,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to redeem perk");
      }

      const result = await response.json();

      // Update local state
      setScannedTicket({
        ...scannedTicket,
        perks: scannedTicket.perks?.map((perk) =>
          perk.id === ticketPerkId
            ? {
                ...perk,
                redeemedQuantity:
                  result.redeemedQuantity ?? perk.redeemedQuantity + 1,
                remainingQuantity:
                  result.remainingQuantity ??
                  Math.max(perk.remainingQuantity - 1, 0),
              }
            : perk
        ),
      });

      alert(`✅ ${perk.name} redeemed successfully!`);
    } catch (err) {
      alert(
        `❌ Failed to redeem perk: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="brand-heading text-4xl font-bold mb-2 bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
            Venue Staff Scanner
          </h1>
          <p className="text-grit-300">Scan tickets and redeem perks</p>
        </div>

        {/* Scanner Input */}
        <Card className="mb-6">
          <div className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={scanMode === "camera" ? "primary" : "secondary"}
                onClick={() => setScanMode("camera")}
                className="flex-1"
              >
                📷 Camera
              </Button>
              <Button
                variant={scanMode === "manual" ? "primary" : "secondary"}
                onClick={() => setScanMode("manual")}
                className="flex-1"
              >
                ⌨️ Manual Entry
              </Button>
            </div>

            {/* Camera Scanner */}
            {scanMode === "camera" && (
              <QRScanner
                onScan={handleCameraScan}
                onError={(err) => setError(err)}
              />
            )}

            {/* Manual Input */}
            {scanMode === "manual" && (
              <div>
                <label className="block text-sm font-medium text-bone-100 mb-2">
                  Enter Ticket QR Code
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleManualScan()}
                    placeholder="UNCHAINED-TICKET:..."
                    className="flex-1 px-4 py-2 bg-grit-500/30 border border-grit-500 rounded-lg text-bone-100 focus:outline-none focus:border-hack-green"
                  />
                  <Button
                    variant="primary"
                    onClick={handleManualScan}
                    disabled={loading}
                  >
                    {loading ? "Scanning..." : "Scan"}
                  </Button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-signal-500/10 border border-signal-500/30 rounded-lg">
                <p className="text-signal-400 text-sm">❌ {error}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Scanned Ticket Details */}
        {scannedTicket && (
          <Card>
            <div className="space-y-6">
              {/* Ticket Info */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="brand-heading text-2xl text-bone-100">
                    Ticket Details
                  </h2>
                  <Badge tone="success">✓ Valid</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-grit-400 mb-1">Event</p>
                    <p className="text-bone-100 font-medium">
                      {scannedTicket.eventName}
                    </p>
                  </div>
                  <div>
                    <p className="text-grit-400 mb-1">Venue</p>
                    <p className="text-bone-100 font-medium">
                      {scannedTicket.venueName}
                    </p>
                  </div>
                  <div>
                    <p className="text-grit-400 mb-1">Tier</p>
                    <p className="text-bone-100 font-medium">
                      {scannedTicket.tierName ||
                        scannedTicket.seatInfo ||
                        "General Admission"}
                    </p>
                    {scannedTicket.seatInfo && (
                      <p className="text-xs text-grit-500">
                        {scannedTicket.seatInfo}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-grit-400 mb-1">Wallet</p>
                    <p className="text-bone-100 font-mono text-xs">
                      {scannedTicket.walletAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Perks */}
              {scannedTicket.perks && scannedTicket.perks.length > 0 && (
                <div className="pt-4 border-t border-grit-500/30">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">🎁</span>
                    <h3 className="font-semibold text-hack-green">
                      Available Perks
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {scannedTicket.perks.map((perk) => (
                      <div
                        key={perk.id}
                        className="flex flex-col gap-3 rounded-lg border border-grit-500/30 bg-grit-500/10 p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-bone-100">
                            {perk.name}
                          </p>
                          <p className="text-xs text-grit-400">
                            {perk.redeemedQuantity} of {perk.quantity} redeemed
                            ({perk.remainingQuantity} remaining)
                          </p>
                          {perk.description && (
                            <p className="mt-1 text-xs text-grit-400">
                              {perk.description}
                            </p>
                          )}
                          {perk.instructions && (
                            <p className="mt-1 text-xs text-grit-300">
                              Redeem: {perk.instructions}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {perk.remainingQuantity > 0 ? (
                            <>
                              <Badge tone="success">
                                {perk.remainingQuantity} left
                              </Badge>
                              <Button
                                variant="primary"
                                onClick={() => handleRedeemPerk(perk.id)}
                                className="whitespace-nowrap"
                                disabled={loading}
                              >
                                Redeem
                              </Button>
                            </>
                          ) : (
                            <Badge tone="info">All Redeemed</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-grit-500/30">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setScannedTicket(null);
                    setQrInput("");
                  }}
                  className="w-full"
                >
                  Scan Another Ticket
                </Button>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
