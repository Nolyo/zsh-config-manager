import { useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  useAliases,
  useAddAlias,
  useUpdateAlias,
  useDeleteAlias,
  useSecretsAliases,
} from "@/lib/hooks/useAliases";
import type { Alias } from "@/lib/types";

type AliasFormData = {
  name: string;
  command: string;
  shared: boolean;
};

export function AliasesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScope, setSelectedScope] = useState<"all" | "shared" | "local">("all");

  // Dialogs state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<AliasFormData>({
    name: "",
    command: "",
    shared: true,
  });
  const [editingAlias, setEditingAlias] = useState<Alias | null>(null);
  const [deletingAlias, setDeletingAlias] = useState<Alias | null>(null);

  // Queries
  const { data: sharedAliases = [], isLoading: isLoadingShared } = useAliases(true);
  const { data: localAliases = [], isLoading: isLoadingLocal } = useAliases(false);
  const { data: secretsAliases = [], isLoading: isLoadingSecrets } = useSecretsAliases();

  // Mutations
  const addMutation = useAddAlias();
  const updateMutation = useUpdateAlias();
  const deleteMutation = useDeleteAlias();

  // Combine and filter aliases
  const allAliases = [
    ...sharedAliases.map((a) => ({ ...a, shared: true })),
    ...localAliases.map((a) => ({ ...a, shared: false })),
    ...secretsAliases.map((a) => ({ ...a, shared: false })),
  ];

  const filteredAliases = allAliases.filter((alias) => {
    const matchesSearch =
      alias.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alias.command.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesScope =
      selectedScope === "all" ||
      (selectedScope === "shared" && alias.shared) ||
      (selectedScope === "local" && !alias.shared);

    return matchesSearch && matchesScope;
  });

  // Handlers
  const handleAdd = async () => {
    try {
      await addMutation.mutateAsync({
        name: formData.name,
        command: formData.command,
        shared: formData.shared,
      });
      toast.success("Alias added successfully", {
        description: `${formData.name} → ${formData.command}`,
      });
      setAddDialogOpen(false);
      setFormData({ name: "", command: "", shared: true });
    } catch (error) {
      toast.error("Failed to add alias", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      console.error("Failed to add alias:", error);
    }
  };

  const handleEdit = async () => {
    if (!editingAlias) return;

    try {
      await updateMutation.mutateAsync({
        oldName: editingAlias.name,
        newName: formData.name,
        command: formData.command,
        shared: formData.shared,
      });
      toast.success("Alias updated successfully", {
        description: `${formData.name} → ${formData.command}`,
      });
      setEditDialogOpen(false);
      setEditingAlias(null);
      setFormData({ name: "", command: "", shared: true });
    } catch (error) {
      toast.error("Failed to update alias", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      console.error("Failed to update alias:", error);
    }
  };

  const handleDelete = async () => {
    if (!deletingAlias) return;

    try {
      await deleteMutation.mutateAsync({
        name: deletingAlias.name,
        shared: deletingAlias.shared,
      });
      toast.success("Alias deleted successfully", {
        description: `${deletingAlias.name} has been removed`,
      });
      setDeleteDialogOpen(false);
      setDeletingAlias(null);
    } catch (error) {
      toast.error("Failed to delete alias", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      console.error("Failed to delete alias:", error);
    }
  };

  const openEditDialog = (alias: Alias) => {
    setEditingAlias(alias);
    setFormData({
      name: alias.name,
      command: alias.command,
      shared: alias.shared,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (alias: Alias) => {
    setDeletingAlias(alias);
    setDeleteDialogOpen(true);
  };

  const isLoading = isLoadingShared || isLoadingLocal || isLoadingSecrets;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Aliases</h2>
          <p className="text-muted-foreground">
            Manage your ZSH aliases across shared and local configurations
          </p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="shadow-lg hover:shadow-xl transition-all hover:scale-105 font-semibold"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Alias
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search aliases..."
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
            All ({allAliases.length})
          </Button>
          <Button
            variant={selectedScope === "shared" ? "default" : "outline"}
            onClick={() => setSelectedScope("shared")}
            className={selectedScope === "shared" ? "font-semibold shadow-lg ring-2 ring-primary/20" : ""}
          >
            Shared ({sharedAliases.length})
          </Button>
          <Button
            variant={selectedScope === "local" ? "default" : "outline"}
            onClick={() => setSelectedScope("local")}
            className={selectedScope === "local" ? "font-semibold shadow-lg ring-2 ring-primary/20" : ""}
          >
            Local ({localAliases.length + secretsAliases.length})
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="max-w-[400px]">Command</TableHead>
              <TableHead className="w-[120px]">Scope</TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading aliases...
                </TableCell>
              </TableRow>
            ) : filteredAliases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No aliases found
                </TableCell>
              </TableRow>
            ) : (
              filteredAliases.map((alias) => (
                <TableRow key={`${alias.shared ? "shared" : "local"}-${alias.name}`}>
                  <TableCell className="font-mono font-medium">
                    {alias.name}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground max-w-[400px] truncate">
                    {alias.command}
                  </TableCell>
                  <TableCell>
                    <Badge variant={alias.shared ? "default" : "secondary"}>
                      {alias.shared ? "Shared" : "Local"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(alias)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(alias)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Alias</DialogTitle>
            <DialogDescription>
              Create a new alias for your ZSH configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Name</Label>
              <Input
                id="add-name"
                placeholder="e.g., ll"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-command">Command</Label>
              <Textarea
                id="add-command"
                placeholder="e.g., ls -lah"
                value={formData.command}
                onChange={(e) =>
                  setFormData({ ...formData, command: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-scope">Scope</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.shared ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, shared: true })}
                  className={`flex-1 transition-all ${
                    formData.shared
                      ? "ring-2 ring-primary/30 shadow-lg font-semibold"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  Shared (versioned)
                </Button>
                <Button
                  type="button"
                  variant={!formData.shared ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, shared: false })}
                  className={`flex-1 transition-all ${
                    !formData.shared
                      ? "ring-2 ring-primary/30 shadow-lg font-semibold"
                      : "opacity-70 hover:opacity-100"
                  }`}
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
                setFormData({ name: "", command: "", shared: true });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!formData.name || !formData.command || addMutation.isPending}
            >
              {addMutation.isPending ? "Adding..." : "Add Alias"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Alias</DialogTitle>
            <DialogDescription>
              Update the alias configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g., ll"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-command">Command</Label>
              <Textarea
                id="edit-command"
                placeholder="e.g., ls -lah"
                value={formData.command}
                onChange={(e) =>
                  setFormData({ ...formData, command: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-scope">Scope</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.shared ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, shared: true })}
                  className={`flex-1 transition-all ${
                    formData.shared
                      ? "ring-2 ring-primary/30 shadow-lg font-semibold"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  Shared (versioned)
                </Button>
                <Button
                  type="button"
                  variant={!formData.shared ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, shared: false })}
                  className={`flex-1 transition-all ${
                    !formData.shared
                      ? "ring-2 ring-primary/30 shadow-lg font-semibold"
                      : "opacity-70 hover:opacity-100"
                  }`}
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
                setEditingAlias(null);
                setFormData({ name: "", command: "", shared: true });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={!formData.name || !formData.command || updateMutation.isPending}
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
            <DialogTitle>Delete Alias</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the alias{" "}
              <span className="font-mono font-semibold">{deletingAlias?.name}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingAlias(null);
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
