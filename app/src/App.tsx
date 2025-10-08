import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Toaster } from "@/components/ui/toaster";
import { Terminal, Settings, Download, FunctionSquare } from "lucide-react";
import { ThemeProvider } from "@/contexts/theme-context";
import { AliasesTab } from "@/components/tabs/AliasesTab";
import { FunctionsTab } from "@/components/tabs/FunctionsTab";
import { ConfigTab } from "@/components/tabs/ConfigTab";
import { ExportTab } from "@/components/tabs/ExportTab";

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b transition-all duration-200 hover:border-border/80">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 group cursor-force-pointer" role="button" tabIndex={0}>
                <Terminal className="h-6 w-6 transition-transform duration-200 group-hover:scale-110 group-hover:text-primary" />
                <h1 className="text-2xl font-bold transition-colors duration-200 group-hover:text-primary">ZSH Config Manager</h1>
              </div>
              <ThemeToggle />
            </div>
            <p className="text-sm text-muted-foreground mt-1 transition-colors duration-200">
              Manage your ZSH configuration across machines
            </p>
          </div>
        </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="aliases" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="aliases" className="gap-2">
                <Terminal className="h-4 w-4" />
                Aliases
              </TabsTrigger>
              <TabsTrigger value="functions" className="gap-2">
                <FunctionSquare className="h-4 w-4" />
                Functions
              </TabsTrigger>
              <TabsTrigger value="config" className="gap-2">
                <Settings className="h-4 w-4" />
                Config
              </TabsTrigger>
              <TabsTrigger value="export" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Aliases Tab */}
          <TabsContent value="aliases" className="animate-in fade-in-50 duration-300">
            <AliasesTab />
          </TabsContent>

          {/* Functions Tab */}
          <TabsContent value="functions" className="animate-in fade-in-50 duration-300">
            <FunctionsTab />
          </TabsContent>

          {/* Config Tab */}
          <TabsContent value="config" className="animate-in fade-in-50 duration-300">
            <ConfigTab />
          </TabsContent>

          {/* Export/Import Tab */}
          <TabsContent value="export" className="animate-in fade-in-50 duration-300">
            <ExportTab />
          </TabsContent>
        </Tabs>
      </main>
      <Toaster />
    </div>
    </ThemeProvider>
  );
}

export default App;
