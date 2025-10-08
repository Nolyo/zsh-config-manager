import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, RefreshCw, AlertCircle } from "lucide-react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useConfig, useUpdateConfig, useReloadZsh } from "@/lib/hooks/useConfig";

export function ConfigTab() {
  const [selectedScope, setSelectedScope] = useState<"shared" | "local">("shared");
  const [editorContent, setEditorContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Queries
  const { data: sharedConfig, isLoading: isLoadingShared } = useConfig(true);
  const { data: localConfig, isLoading: isLoadingLocal } = useConfig(false);

  // Mutations
  const updateMutation = useUpdateConfig();
  const reloadMutation = useReloadZsh();

  // Current config based on selected scope
  const currentConfig = selectedScope === "shared" ? sharedConfig : localConfig;
  const isLoading = selectedScope === "shared" ? isLoadingShared : isLoadingLocal;

  // Update editor content when config loads or scope changes
  useEffect(() => {
    if (currentConfig) {
      setEditorContent(currentConfig.content);
      setHasChanges(false);
    }
  }, [currentConfig, selectedScope]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        content: editorContent,
        shared: selectedScope === "shared",
      });
      toast.success("Configuration saved successfully", {
        description: `${selectedScope === "shared" ? "Shared" : "Local"} config updated`,
      });
      setHasChanges(false);
    } catch (error) {
      toast.error("Failed to save configuration", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      console.error("Failed to save config:", error);
    }
  };

  const handleReload = async () => {
    try {
      const message = await reloadMutation.mutateAsync();
      toast.success("ZSH configuration reloaded", {
        description: message,
      });
    } catch (error) {
      toast.error("Failed to reload ZSH", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      console.error("Failed to reload ZSH:", error);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value);
      setHasChanges(value !== currentConfig?.content);
    }
  };

  const handleDiscard = () => {
    if (currentConfig) {
      setEditorContent(currentConfig.content);
      setHasChanges(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configuration</h2>
          <p className="text-muted-foreground">
            Edit your ZSH configuration directly
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReload}
            disabled={reloadMutation.isPending}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${reloadMutation.isPending ? 'animate-spin' : ''}`} />
            Reload ZSH
          </Button>
        </div>
      </div>

      {/* Scope Selector */}
      <div className="flex gap-2">
        <Button
          variant={selectedScope === "shared" ? "default" : "outline"}
          onClick={() => setSelectedScope("shared")}
        >
          Shared (versioned)
        </Button>
        <Button
          variant={selectedScope === "local" ? "default" : "outline"}
          onClick={() => setSelectedScope("local")}
        >
          Local (this machine)
        </Button>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {selectedScope === "shared"
            ? "Editing ~/.zsh/config.zsh - These changes will be versioned in Git."
            : "Editing ~/.zsh/config.local.zsh - These changes are local to this machine and will NOT be versioned."
          }
        </AlertDescription>
      </Alert>

      {/* Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            {selectedScope === "shared" ? "~/.zsh/config.zsh" : "~/.zsh/config.local.zsh"}
          </div>
          {hasChanges && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscard}
              >
                Discard Changes
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>

        <div className="border rounded-md overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-[600px]">
              <p className="text-muted-foreground">Loading configuration...</p>
            </div>
          ) : (
            <Editor
              height="600px"
              defaultLanguage="shell"
              value={editorContent}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: true },
                fontSize: 13,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: "on",
                tabSize: 2,
              }}
            />
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="text-sm text-muted-foreground">
        <p className="font-medium mb-2">Configuration Tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Use <code className="bg-muted px-1 rounded">export PATH="$PATH:/your/path"</code> to add to PATH</li>
          <li>Set environment variables with <code className="bg-muted px-1 rounded">export VAR_NAME="value"</code></li>
          <li>Enable ZSH options with <code className="bg-muted px-1 rounded">setopt OPTION_NAME</code></li>
          <li>After saving, click "Reload ZSH" or run <code className="bg-muted px-1 rounded">source ~/.zshrc</code> in your terminal</li>
        </ul>
      </div>
    </div>
  );
}
