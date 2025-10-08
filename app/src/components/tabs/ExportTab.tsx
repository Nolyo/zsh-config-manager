import { useState } from "react";
import { toast } from "sonner";
import {
  GitBranch,
  GitPullRequest,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  useGitStatus,
  useGitPull,
  useGitPush,
  useGitCommit,
  useGitLog,
  useGitInit,
} from "@/lib/hooks/useGit";

export function ExportTab() {
  const [commitMessage, setCommitMessage] = useState("");
  const [commitDialogOpen, setCommitDialogOpen] = useState(false);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const { data: gitStatus, isLoading: statusLoading, error: statusError } = useGitStatus();
  const { data: gitHistory } = useGitLog(10);
  const gitPull = useGitPull();
  const gitPush = useGitPush();
  const gitCommitMutation = useGitCommit();
  const gitInitMutation = useGitInit();

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;

    try {
      await gitCommitMutation.mutateAsync(commitMessage);
      toast.success("Changes committed successfully", {
        description: commitMessage,
      });
      setCommitMessage("");
      setCommitDialogOpen(false);
    } catch (error) {
      toast.error("Failed to commit changes", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      console.error("Commit failed:", error);
    }
  };

  const handlePull = async () => {
    try {
      const result = await gitPull.mutateAsync();
      toast.success("Pull completed successfully", {
        description: result || "Your local branch is up to date",
      });
    } catch (error) {
      toast.error("Failed to pull changes", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      console.error("Pull failed:", error);
    }
  };

  const handlePush = async () => {
    try {
      const result = await gitPush.mutateAsync();
      toast.success("Push completed successfully", {
        description: result || "All commits have been pushed to remote",
      });
    } catch (error) {
      toast.error("Failed to push changes", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      console.error("Push failed:", error);
    }
  };

  const handleInit = async () => {
    setIsInitializing(true);
    try {
      await gitInitMutation.mutateAsync();
      toast.success("Git repository initialized", {
        description: "You can now start tracking your ZSH configuration changes",
      });
    } catch (error) {
      toast.error("Failed to initialize Git repository", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      console.error("Git init failed:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  // If there's an error (likely means Git is not initialized)
  if (statusError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Git Repository</CardTitle>
            <CardDescription>Initialize Git repository for version control</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Git repository not initialized. Click the button below to initialize Git in your ZSH
                config directory.
              </AlertDescription>
            </Alert>
            <Button onClick={handleInit} disabled={isInitializing}>
              <GitBranch className="mr-2 h-4 w-4" />
              {isInitializing ? "Initializing..." : "Initialize Git Repository"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export/Import</CardTitle>
            <CardDescription>Export and import your configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Export/Import functionality will be available after Git is initialized.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (statusLoading || !gitStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Git Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading Git status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasChanges = !gitStatus.clean;

  return (
    <div className="space-y-6">
      {/* Git Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Git Status
            </span>
            {gitStatus.clean ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Clean
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <AlertCircle className="mr-1 h-3 w-3" />
                Changes
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Track and sync your ZSH configuration changes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">Current Branch</div>
              <div className="text-sm text-muted-foreground">{gitStatus.branch}</div>
            </div>
            <div className="flex items-center gap-4">
              {gitStatus.ahead > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <ArrowUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{gitStatus.ahead}</span>
                </div>
              )}
              {gitStatus.behind > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <ArrowDown className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">{gitStatus.behind}</span>
                </div>
              )}
            </div>
          </div>

          {hasChanges && (
            <div className="space-y-2">
              {gitStatus.modified.length > 0 && (
                <div className="space-y-1">
                  <div className="text-sm font-medium">Modified Files ({gitStatus.modified.length})</div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {gitStatus.modified.map((file) => (
                      <div key={file} className="pl-2">
                        • {file}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {gitStatus.untracked.length > 0 && (
                <div className="space-y-1">
                  <div className="text-sm font-medium">Untracked Files ({gitStatus.untracked.length})</div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {gitStatus.untracked.map((file) => (
                      <div key={file} className="pl-2">
                        • {file}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => setCommitDialogOpen(true)}
              disabled={!hasChanges || gitCommitMutation.isPending}
            >
              <GitPullRequest className="mr-2 h-4 w-4" />
              Commit Changes
            </Button>
            <Button
              variant="outline"
              onClick={handlePull}
              disabled={gitPull.isPending || gitStatus.behind === 0}
            >
              <ArrowDown className="mr-2 h-4 w-4" />
              Pull {gitStatus.behind > 0 && `(${gitStatus.behind})`}
            </Button>
            <Button
              variant="outline"
              onClick={handlePush}
              disabled={gitPush.isPending || gitStatus.ahead === 0}
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              Push {gitStatus.ahead > 0 && `(${gitStatus.ahead})`}
            </Button>
            <Button variant="outline" onClick={() => setLogDialogOpen(true)}>
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export/Import Card */}
      <Card>
        <CardHeader>
          <CardTitle>Export/Import Configuration</CardTitle>
          <CardDescription>Backup and restore your entire ZSH configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              <Download className="mr-2 h-4 w-4" />
              Export Config
            </Button>
            <Button variant="outline" disabled>
              <Upload className="mr-2 h-4 w-4" />
              Import Config
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Export/Import functionality coming soon. For now, use Git commands above to manage your
            configuration.
          </p>
        </CardContent>
      </Card>

      {/* Commit Dialog */}
      <Dialog open={commitDialogOpen} onOpenChange={setCommitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Commit Changes</DialogTitle>
            <DialogDescription>
              Enter a commit message to save your changes to the Git history.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="commit-message">Commit Message</Label>
              <Input
                id="commit-message"
                placeholder="Update ZSH configuration"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCommit();
                  }
                }}
              />
            </div>
            {hasChanges && (
              <div className="text-sm space-y-1">
                <div className="font-medium">Files to commit:</div>
                <div className="text-muted-foreground space-y-0.5">
                  {[...gitStatus.modified, ...gitStatus.untracked].map((file) => (
                    <div key={file} className="pl-2">
                      • {file}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommitDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCommit}
              disabled={!commitMessage.trim() || gitCommitMutation.isPending}
            >
              {gitCommitMutation.isPending ? "Committing..." : "Commit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[600px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Commit History</DialogTitle>
            <DialogDescription>Recent commits in your ZSH configuration repository</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {gitHistory && gitHistory.length > 0 ? (
              gitHistory.map((commit) => (
                <div key={commit.hash} className="border-b pb-4 last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">{commit.message}</div>
                      <div className="text-sm text-muted-foreground">
                        {commit.author} • {new Date(commit.date).toLocaleString()}
                      </div>
                    </div>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {commit.hash.substring(0, 7)}
                    </code>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                No commits yet. Make your first commit to see history here.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
