import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Upload,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import { LoadingSpinner } from "../LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { AdminErrorBoundary, AdminErrorFallback } from "./AdminErrorBoundary";
import { useContentList } from "../../hooks/useAdminApi";
// Placeholder for BlogEditor component
// import { BlogEditor } from "./BlogEditor";

export function BlogManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const { data: articles, isLoading, error } = useContentList({ limit: 50 });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => backend.content.deleteArticle({ id }),
    onSuccess: () => {
      toast({ title: "Article deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
    },
    onError: (error) => {
      toast({ title: "Failed to delete article", variant: "destructive" });
      console.error(error);
    },
  });

  const handleNewPost = () => {
    setSelectedArticle(null);
    setIsEditorOpen(true);
  };

  const handleEditPost = (article: any) => {
    setSelectedArticle(article);
    setIsEditorOpen(true);
  };

  if (error) {
    return (
      <AdminErrorFallback 
        error={error} 
        context="Blog Management" 
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <AdminErrorBoundary context="Blog Management">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600">Create, edit, and manage all your blog posts.</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input placeholder="Search posts..." className="w-64" />
            <Button variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button onClick={handleNewPost}>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>

        {/* Blog List Table */}
        <AdminErrorBoundary context="Articles Table" fallback={
          <AdminErrorFallback context="Articles Table" />
        }>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <LoadingSpinner />
                    </TableCell>
                  </TableRow>
                ) : (
                  articles?.articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">{article.title}</TableCell>
                      <TableCell>
                        <Badge variant={article.published ? "default" : "secondary"}>
                          {article.published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(article.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="space-x-1">
                        {article.tags?.slice(0, 2).map((tag) => (
                          <Badge key={tag.id} variant="outline">
                            {tag.name}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEditPost(article)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => deleteMutation.mutate(article.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </AdminErrorBoundary>
      
      {/* Placeholder for BlogEditor Dialog */}
      {/* <BlogEditor 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        article={selectedArticle} 
      /> */}
      </div>
    </AdminErrorBoundary>
  );
}
