import { useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  useFunctions,
  useAddFunction,
  useUpdateFunction,
  useDeleteFunction,
} from "@/lib/hooks/useFunctions";
import type { ShellFunction } from "@/lib/types";

type FunctionFormData = {
  name: string;
  content: string;
  shared: boolean;
};

export function FunctionsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScope, setSelectedScope] = useState<"all" | "shared" | "local">("all");

  // Dialogs state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FunctionFormData>({
    name: "",
    content: "",
    shared: true,
  });
  const [editingFunction, setEditingFunction] = useState<ShellFunction | null>(null);
  const [deletingFunction, setDeletingFunction] = useState<ShellFunction | null>(null);

  // Queries
  const { data: sharedFunctions = [], isLoading: isLoadingShared } = useFunctions(true);
  const { data: localFunctions = [], isLoading: isLoadingLocal } = useFunctions(false);

  // Mutations
  const addMutation = useAddFunction();
  const updateMutation = useUpdateFunction();
  const deleteMutation = useDeleteFunction();

  // Combine and filter functions
  const allFunctions = [
    ...sharedFunctions.map((f) => ({ ...f, shared: true })),
    ...localFunctions.map((f) => ({ ...f, shared: false })),
  ];

  const filteredFunctions = allFunctions.filter((func) => {
    const matchesSearch =
      func.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      func.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesScope =
      selectedScope === "all" ||
      (selectedScope === "shared" && func.shared) ||
      (selectedScope === "local" && !func.shared);

    return matchesSearch && matchesScope;
  });

  // Handlers
  const handleAdd = async () => {
    try {
      await addMutation.mutateAsync({
        name: formData.name,
        content: formData.content,
        shared: formData.shared,
      });
      toast.success("Function added successfully", {
        description: formData.name,
      });
      setAddDialogOpen(false);
      setFormData({ name: "", content: "", shared: true });
    } catch (error) {
      toast.error("Failed to add function", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      console.error("Failed to add function:", error);
    }
  };

  const handleEdit = async () => {
    if (!editingFunction) return;

    try {
      await updateMutation.mutateAsync({
        name: editingFunction.name,
        content: formData.content,
        shared: formData.shared,
      });
      toast.success("Function updated successfully", {
        description: formData.name,
      });
      setEditDialogOpen(false);
      setEditingFunction(null);
      setFormData({ name: "", content: "", shared: true });
    } catch (error) {
      toast.error("Failed to update function", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      console.error("Failed to update function:", error);
    }
  };

  const handleDelete = async () => {
    if (!deletingFunction) return;

    try {
      await deleteMutation.mutateAsync({
        name: deletingFunction.name,
        shared: deletingFunction.shared,
      });
      toast.success("Function deleted successfully", {
        description: `${deletingFunction.name} has been removed`,
      });
      setDeleteDialogOpen(false);
      setDeletingFunction(null);
    } catch (error) {
      toast.error("Failed to delete function", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      console.error("Failed to delete function:", error);
    }
  };

  const openEditDialog = (func: ShellFunction) => {
    setEditingFunction(func);
    setFormData({
      name: func.name,
      content: func.content,
      shared: func.shared,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (func: ShellFunction) => {
    setDeletingFunction(func);
    setDeleteDialogOpen(true);
  };

  const isLoading = isLoadingShared || isLoadingLocal;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Functions</h2>
          <p className="text-muted-foreground">
            Manage your ZSH functions across shared and local configurations
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Function
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search functions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedScope === "all" ? "default" : "outline"}
            onClick={() => setSelectedScope("all")}
            className={selectedScope === "all" ? "font-semibold shadow-lg ring-2 ring-primary/20" : ""}
          >
            All ({allFunctions.length})
          </Button>
          <Button
            variant={selectedScope === "shared" ? "default" : "outline"}
            onClick={() => setSelectedScope("shared")}
            className={selectedScope === "shared" ? "font-semibold shadow-lg ring-2 ring-primary/20" : ""}
          >
            Shared ({sharedFunctions.length})
          </Button>
          <Button
            variant={selectedScope === "local" ? "default" : "outline"}
            onClick={() => setSelectedScope("local")}
            className={selectedScope === "local" ? "font-semibold shadow-lg ring-2 ring-primary/20" : ""}
          >
            Local ({localFunctions.length})
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Content Preview</TableHead>
              <TableHead className="w-[100px]">Scope</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading functions...
                </TableCell>
              </TableRow>
            ) : filteredFunctions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No functions found
                </TableCell>
              </TableRow>
            ) : (
              filteredFunctions.map((func) => (
                <TableRow key={`${func.shared ? "shared" : "local"}-${func.name}`}>
                  <TableCell className="font-mono font-medium">
                    {func.name}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground max-w-md truncate">
                    {func.content.split('\n')[0] || "(empty)"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={func.shared ? "default" : "secondary"}>
                      {func.shared ? "Shared" : "Local"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(func)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(func)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Function</DialogTitle>
            <DialogDescription>
              Create a new ZSH function
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Function Name</Label>
              <Input
                id="add-name"
                placeholder="e.g., mkcd"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-content">Function Body</Label>
              <div className="border rounded-md overflow-hidden">
                <Editor
                  height="300px"
                  defaultLanguage="shell"
                  value={formData.content}
                  onChange={(value) =>
                    setFormData({ ...formData, content: value || "" })
                  }
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-scope">Scope</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.shared ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, shared: true })}
                  className="flex-1"
                >
                  Shared (versioned)
                </Button>
                <Button
                  type="button"
                  variant={!formData.shared ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, shared: false })}
                  className="flex-1"
                >
                  Local (this machine)
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false);
                setFormData({ name: "", content: "", shared: true });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!formData.name || !formData.content || addMutation.isPending}
            >
              {addMutation.isPending ? "Adding..." : "Add Function"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Function</DialogTitle>
            <DialogDescription>
              Update the function: <span className="font-mono font-semibold">{editingFunction?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-content">Function Body</Label>
              <div className="border rounded-md overflow-hidden">
                <Editor
                  height="300px"
                  defaultLanguage="shell"
                  value={formData.content}
                  onChange={(value) =>
                    setFormData({ ...formData, content: value || "" })
                  }
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-scope">Scope</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.shared ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, shared: true })}
                  className="flex-1"
                >
                  Shared (versioned)
                </Button>
                <Button
                  type="button"
                  variant={!formData.shared ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, shared: false })}
                  className="flex-1"
                >
                  Local (this machine)
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditingFunction(null);
                setFormData({ name: "", content: "", shared: true });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={!formData.content || updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Function</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the function{" "}
              <span className="font-mono font-semibold">{deletingFunction?.name}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingFunction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
