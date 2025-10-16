import { Switch, Route, useParams, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { useAuth } from "./hooks/useAuth";
import NotFound from "./pages/not-found";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Backtest from "./pages/Backtest";
import Trades from "./pages/Trades";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Journal from "./pages/Journal";
import Notebook from "./pages/Notebook";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Layout from "./components/Layout";
import AdvancedBacktestChart from "./components/AdvancedBacktestChart";
import { Preloader, LoadingSpinner } from "./components/Preloader";
import { supabase } from "./lib/supabaseClient";
import { useState, useEffect } from "react";
import { useToast } from "./hooks/use-toast";
import { queryClient } from "./lib/queryClient";

interface TradingSession {
  id: string;
  name: string;
  pair: string;
  startingBalance: string;
  currentBalance: string;
  startDate: string;
  description?: string;
  isActive: boolean;
}

// Create a component to handle the fullscreen chart route
function FullscreenChart() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [session, setSession] = useState<TradingSession | null>(null);
  const [loading, setLoading] = useState(true);

  const handleExit = () => {
    setLocation("/backtest");
  };

  useEffect(() => {
    const fetchSession = async () => {
      if (!params.id) {
        toast({
          title: "Error",
          description: "No session ID provided",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('trading_sessions')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) {
          throw new Error(error.message);
        }

        if (!data) {
          toast({
            title: "Error",
            description: "Session not found",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        setSession(data as TradingSession);
      } catch (error) {
        console.error("Error fetching session:", error);
        toast({
          title: "Error",
          description: "Failed to load session data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [params.id, toast]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#131722]">
        <LoadingSpinner size="lg" withLogo={true} className="text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-[#131722] text-white">
        <p className="text-xl mb-4">Session not found</p>
        <button 
          onClick={handleExit}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Back to Backtest
        </button>
      </div>
    );
  }

  return (
    <AdvancedBacktestChart 
      session={session} 
      onExit={handleExit} 
    />
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showPreloader, setShowPreloader] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // DEBUG: Log authentication state
  console.log('🔍 ROUTER DEBUG:', {
    isAuthenticated,
    isLoading,
    currentPath: window.location.pathname
  });

  useEffect(() => {
    // Show preloader on initial load
    if (!isLoading && !appReady) {
      setAppReady(true);
    }
  }, [isLoading, appReady]);

  const handlePreloaderComplete = () => {
    setShowPreloader(false);
  };

  // Show preloader on initial app load
  if (showPreloader && appReady) {
    return <Preloader onComplete={handlePreloaderComplete} minDuration={2500} />;
  }

  // Show loading spinner while auth is loading
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" withLogo={true} className="text-primary" />
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={SignUp} />
          <Route path="/about" component={About} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/terms" component={TermsOfService} />
          <Route path="/privacy" component={PrivacyPolicy} />
        </>
      ) : (
        <>
          {/* Regular routes with layout */}
          <Route path="/" component={() => <Layout><Dashboard /></Layout>} />
          <Route path="/backtest" component={() => <Layout><Backtest /></Layout>} />
          <Route path="/backtest/session/:id" component={() => <Layout><Backtest /></Layout>} />
          <Route path="/trades" component={() => <Layout><Trades /></Layout>} />
          <Route path="/analytics" component={() => <Layout><Analytics /></Layout>} />
          <Route path="/reports" component={() => <Layout><Reports /></Layout>} />
          <Route path="/journal" component={() => <Layout><Journal /></Layout>} />
          <Route path="/notebook" component={() => <Layout><Notebook /></Layout>} />
          <Route path="/settings" component={() => <Layout><Settings /></Layout>} />
          
          {/* Fullscreen chart route without layout */}
          <Route path="/fullscreen-chart/:id" component={FullscreenChart} />
          
          {/* Catch-all route for authenticated users - redirect to dashboard */}
          <Route path="*" component={() => {
            window.location.href = '/';
            return null;
          }} />
        </>
      )}
      
      {/* Catch-all route for unauthenticated users - redirect to landing */}
      <Route path="*" component={() => {
        if (!isAuthenticated) {
          window.location.href = '/';
          return null;
        }
        return <NotFound />;
      }} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;