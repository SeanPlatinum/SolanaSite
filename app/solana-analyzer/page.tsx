"use client"

import { useState } from "react"
import DashboardPageLayout from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import BoomIcon from "@/components/icons/boom"
import CuteRobotIcon from "@/components/icons/cute-robot"
import ProcessorIcon from "@/components/icons/proccesor"

export default function SolanaAnalyzer() {
  const [mint, setMint] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setResults(null)
    if (!mint) return setError("Enter a mint address")
    setLoading(true)
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mint }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "API error")
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardPageLayout
      header={{
        title: "Solana Token Analyzer",
        description: "Analyze token holders and trading patterns",
        icon: BoomIcon,
      }}
    >
      <div className="space-y-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Token Analysis</CardTitle>
            <CardDescription>
              Enter a Solana token mint address to analyze top holders and trading patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                placeholder="Token mint address (e.g., EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v)"
                value={mint}
                onChange={(e) => setMint(e.target.value.trim())}
                className="flex-1"
              />
              <Button disabled={loading} type="submit">
                {loading ? (
                  <>
                    <ProcessorIcon className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze"
                )}
              </Button>
            </form>
            {error && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Token Metadata */}
            {results.tokenMetadata && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ProcessorIcon className="h-5 w-5" />
                    Token Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-semibold">{results.tokenMetadata.name || "Unknown"}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Symbol</p>
                      <p className="font-semibold">{results.tokenMetadata.symbol || "UNK"}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-semibold">
                        {results.tokenPrice?.usdPrice 
                          ? `$${results.tokenPrice.usdPrice.toFixed(6)}` 
                          : "N/A"
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Holders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CuteRobotIcon className="h-5 w-5" />
                  Top Holders
                </CardTitle>
                <CardDescription>Ranked by token amount held</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results?.topHolders?.length > 0 ? (
                    results.topHolders.slice(0, 10).map((holder, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <p className="font-mono text-sm truncate max-w-[300px]">
                            {holder.owner === "unknown" ? "Unknown Owner" : holder.owner}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{holder.tokenAmount}</p>
                          <p className="text-xs text-muted-foreground">tokens held</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No holder data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Sellers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BoomIcon className="h-5 w-5" />
                  Top Sellers
                </CardTitle>
                <CardDescription>Based on outgoing token transfers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.topSellers.map((seller, index) => (
                    <div key={seller.owner} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <p className="font-mono text-sm truncate max-w-[300px]">{seller.owner}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{seller.tokensSent}</p>
                        <p className="text-xs text-muted-foreground">tokens sent</p>
                        {seller.detectedSwapSOLReceived > 0 && (
                          <p className="text-xs text-success">{seller.detectedSwapSOLReceived} SOL</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Profit-Like */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ProcessorIcon className="h-5 w-5" />
                  Estimated Top Earners
                </CardTitle>
                <CardDescription>Based on detected SOL received in swap-like transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.topProfitLike.map((profit, index) => (
                    <div key={profit.owner} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <p className="font-mono text-sm truncate max-w-[300px]">{profit.owner}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-success">{profit.estimatedSOLReceived} SOL</p>
                        <p className="text-xs text-muted-foreground">{profit.tokensSentInSwaps} tokens in swaps</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-md">
                  <p className="text-warning text-xs">
                    Note: These are estimates using heuristics. Not exact profits. For production-grade calculations,
                    use an indexer and incorporate historical price data.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardPageLayout>
  )
}
