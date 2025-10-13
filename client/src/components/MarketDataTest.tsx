import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { marketDataService } from '@/services/marketDataService';
import { Loader2, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

export function MarketDataTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [instruments, setInstruments] = useState<any>(null);
  const [sampleQuote, setSampleQuote] = useState<any>(null);

  const testTwelveData = async () => {
    setIsLoading(true);
    try {
      // Test basic API connectivity
      const response = await fetch('/api/test-twelve-data');
      const result = await response.json();
      setTestResult(result);

      // Get supported instruments
      const instrumentsResponse = await marketDataService.getSupportedInstruments();
      setInstruments(instrumentsResponse);

      // Get a sample quote
      try {
        const quoteResponse = await marketDataService.getQuote('EURUSD');
        setSampleQuote(quoteResponse);
      } catch (error) {
        console.log('Quote test failed:', error);
      }

    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-test on component mount
    testTwelveData();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Twelve Data Integration Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            onClick={testTwelveData} 
            disabled={isLoading}
            size="sm"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Test Connection
          </Button>
          
          {testResult && (
            <Badge variant={testResult.success ? "default" : "destructive"}>
              {testResult.success ? (
                <><CheckCircle className="w-3 h-3 mr-1" /> Connected</>
              ) : (
                <><XCircle className="w-3 h-3 mr-1" /> Failed</>
              )}
            </Badge>
          )}
        </div>

        {testResult && (
          <div className="space-y-3">
            {testResult.success ? (
              <div className="space-y-2">
                <p className="text-sm text-green-600 font-medium">
                  ✅ Twelve Data API is working correctly!
                </p>
                
                {testResult.sampleData && (
                  <div className="text-xs text-muted-foreground">
                    Sample data: {testResult.sampleData.values?.length || 0} candles received
                  </div>
                )}

                {instruments?.success && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Supported Instruments:</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(instruments.data || {}).slice(0, 8).map((symbol) => (
                        <Badge key={symbol} variant="outline" className="text-xs">
                          {symbol}
                        </Badge>
                      ))}
                      {Object.keys(instruments.data || {}).length > 8 && (
                        <Badge variant="outline" className="text-xs">
                          +{Object.keys(instruments.data || {}).length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {sampleQuote?.success && (
                  <div className="text-xs text-muted-foreground">
                    Live EURUSD: {sampleQuote.data?.close || 'N/A'}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-red-600 font-medium">
                  ❌ Twelve Data connection failed
                </p>
                <p className="text-xs text-muted-foreground">
                  Error: {testResult.error}
                </p>
                <p className="text-xs text-muted-foreground">
                  Check your API key configuration and network connection.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}