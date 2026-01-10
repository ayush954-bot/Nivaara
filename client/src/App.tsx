import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Properties from "./pages/Properties";
import Team from "./pages/Team";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Locations from "./pages/Locations";
import ChatWidget from "./components/ChatWidget";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path={"/"} component={Home} />
          <Route path={"/about"} component={About} />
          <Route path={"/services"} component={Services} />
          <Route path={"/properties"} component={Properties} />
          <Route path={"/team"} component={Team} />
          <Route path={"/contact"} component={Contact} />
          <Route path={"/faq"} component={FAQ} />
          <Route path={"/locations"} component={Locations} />
          <Route path={"/404"} component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
