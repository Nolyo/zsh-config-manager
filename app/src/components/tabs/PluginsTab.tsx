import { useState } from "react";
import { toast } from "sonner";
import { Plus, Minus, Search, ExternalLink, AlertCircle, CheckCircle, XCircle, Code, Copy } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  usePlugins,
  usePopularPlugins,
  useAddPlugin,
  useRemovePlugin,
} from "@/lib/hooks/usePlugins";
import type { Plugin } from "@/lib/types";

export function PluginsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedView, setSelectedView] = useState<"enabled" | "available">("enabled");
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);

  // Queries
  const { data: enabledPlugins = [], isLoading: isLoadingEnabled } = usePlugins();
  const { data: popularPlugins = [], isLoading: isLoadingPopular } = usePopularPlugins();

  // Mutations
  const addMutation = useAddPlugin();
  const removeMutation = useRemovePlugin();

  // Current plugins based on view
  const currentPlugins = selectedView === "enabled" ? enabledPlugins : popularPlugins;
  const isLoading = selectedView === "enabled" ? isLoadingEnabled : isLoadingPopular;

  // Filter plugins by search
  const filteredPlugins = currentPlugins.filter((plugin) =>
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleOpenRepository = async (url: string, event?: React.MouseEvent) => {
    // Prevent event propagation to avoid triggering table row click
    event?.stopPropagation();

    console.log("Opening URL:", url);

    try {
      await invoke("open_url_wsl", { url });
      toast.success("Opening repository...", {
        description: "Link opened in your default browser",
      });
    } catch (error) {
      toast.error("Failed to open link", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      console.error("Failed to open repository:", error);
    }
  };

  const handleAddPlugin = async (pluginName: string) => {
    try {
      await addMutation.mutateAsync(pluginName);
      toast.success("Plugin enabled successfully", {
        description: `${pluginName} has been added to your configuration`,
      });
    } catch (error) {
      toast.error("Failed to enable plugin", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      console.error("Failed to add plugin:", error);
    }
  };

  const handleRemovePlugin = async (pluginName: string) => {
    try {
      await removeMutation.mutateAsync(pluginName);
      toast.success("Plugin disabled successfully", {
        description: `${pluginName} has been removed from your configuration`,
      });
    } catch (error) {
      toast.error("Failed to disable plugin", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      console.error("Failed to remove plugin:", error);
    }
  };

  const handleShowInstallInstructions = (plugin: Plugin, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setSelectedPlugin(plugin);
    setInstallDialogOpen(true);
  };

  const handleCopyInstallCommand = () => {
    if (selectedPlugin?.install_command) {
      navigator.clipboard.writeText(selectedPlugin.install_command);
      toast.success("Command copied to clipboard", {
        description: "Paste it in your terminal to install the plugin",
      });
    }
  };

  const getPluginStatusBadge = (plugin: Plugin) => {
    if (plugin.enabled && plugin.installed) {
      return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
    }
    if (plugin.enabled && !plugin.installed) {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Not Installed</Badge>;
    }
    if (!plugin.enabled && plugin.installed) {
      return <Badge variant="secondary">Installed</Badge>;
    }
    return <Badge variant="outline">Available</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Plugins</h2>
          <p className="text-muted-foreground">
            Manage your ZSH plugins (Oh-My-Zsh, custom, etc.)
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Plugins are managed in <code className="bg-muted px-1 rounded">~/.zshrc.local</code>.
          After enabling/disabling plugins, run <code className="bg-muted px-1 rounded">source ~/.zshrc</code> to reload your shell.
        </AlertDescription>
      </Alert>

      {/* View Selector and Search */}
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <Button
            variant={selectedView === "enabled" ? "default" : "outline"}
            onClick={() => setSelectedView("enabled")}
            className={`transition-all ${
              selectedView === "enabled"
                ? "ring-2 ring-primary/30 shadow-lg font-semibold"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            Enabled ({enabledPlugins.length})
          </Button>
          <Button
            variant={selectedView === "available" ? "default" : "outline"}
            onClick={() => setSelectedView("available")}
            className={`transition-all ${
              selectedView === "available"
                ? "ring-2 ring-primary/30 shadow-lg font-semibold"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            Available ({popularPlugins.length})
          </Button>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search plugins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Plugin</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading plugins...
                </TableCell>
              </TableRow>
            ) : filteredPlugins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  {searchQuery ? "No plugins found matching your search" : "No plugins found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredPlugins.map((plugin) => (
                <TableRow key={plugin.name}>
                  <TableCell className="font-mono font-medium">
                    <div className="flex items-center gap-2">
                      {plugin.name}
                      {plugin.install_command && (
                        <button
                          onClick={(e) => handleShowInstallInstructions(plugin, e)}
                          className="text-muted-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center justify-center p-1 rounded hover:bg-muted"
                          title="Show installation instructions"
                          type="button"
                        >
                          <Code className="h-4 w-4" />
                        </button>
                      )}
                      {plugin.repository && (
                        <button
                          onClick={(e) => handleOpenRepository(plugin.repository!, e)}
                          className="text-muted-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center justify-center p-1 rounded hover:bg-muted"
                          title="Open repository in browser"
                          type="button"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {plugin.description || "No description available"}
                  </TableCell>
                  <TableCell>
                    {getPluginStatusBadge(plugin)}
                  </TableCell>
                  <TableCell className="text-right">
                    {plugin.enabled ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePlugin(plugin.name)}
                        disabled={removeMutation.isPending}
                      >
                        <Minus className="h-4 w-4 mr-1" />
                        Disable
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddPlugin(plugin.name)}
                        disabled={addMutation.isPending}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Enable
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Help Text */}
      {selectedView === "available" && (
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-2">Installation Notes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Most plugins marked as "Available" are built-in Oh-My-Zsh plugins and don&apos;t require installation
            </li>
            <li>
              For <code className="bg-muted px-1 rounded">zsh-autosuggestions</code> and <code className="bg-muted px-1 rounded">zsh-syntax-highlighting</code>,
              install with: <code className="bg-muted px-1 rounded">git clone [repo] ~/.oh-my-zsh/custom/plugins/[name]</code>
            </li>
            <li>
              After enabling plugins, reload your shell with <code className="bg-muted px-1 rounded">source ~/.zshrc</code>
            </li>
          </ul>
        </div>
      )}

      {/* Installation Instructions Dialog */}
      <Dialog open={installDialogOpen} onOpenChange={setInstallDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Installation Instructions - {selectedPlugin?.name}</DialogTitle>
            <DialogDescription>
              Follow these steps to install and enable this plugin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPlugin?.install_command && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Step 1: Run the installation command</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyInstallCommand}
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Command
                    </Button>
                  </div>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono whitespace-pre">
                      <code>{selectedPlugin.install_command}</code>
                    </pre>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Step 2: Enable the plugin</h3>
                  <p className="text-sm text-muted-foreground">
                    Click the &quot;Enable&quot; button in the plugins list to add it to your <code className="bg-muted px-1 rounded">~/.zshrc.local</code>
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Step 3: Reload your shell</h3>
                  <pre className="bg-muted p-3 rounded-lg text-xs font-mono">
                    <code>source ~/.zshrc</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
