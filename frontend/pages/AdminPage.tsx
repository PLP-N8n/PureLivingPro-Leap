import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Edit, Plus } from "lucide-react";
import { LoadingSpinner } from "../components/LoadingSpinner";
import type { CreateArticleRequest, CreateCategoryRequest, CreateTagRequest } from "~backend/content/types";

export function AdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states
  const [articleForm, setArticleForm] = useState<CreateArticleRequest>({
    title: "",
    content: "",
    excerpt: "",
    featuredImageUrl: "",
    authorName: "",
    authorEmail: "",
    published: false,
    featured: false,
  });

  const [categoryForm, setCategoryForm] = useState<CreateCategoryRequest>({
    name: "",
    description: "",
  });

  const [tagForm, setTagForm] = useState<CreateTagRequest>({
    name: "",
  });

  // Queries
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ["admin", "articles"],
    queryFn: () => backend.content.listArticles({ limit: 50 }),
  });

  const { data: categories } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => backend.content.listCategories(),
  });

  const { data: tags } = useQuery({
    queryKey: ["admin", "tags"],
    queryFn: () => backend.content.listTags(),
  });

  // Mutations
  const createArticleMutation = useMutation({
    mutationFn: (data: CreateArticleRequest) => backend.content.createArticle(data),
    onSuccess: () => {
      toast({ title: "Article created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
      setArticleForm({
        title: "",
        content: "",
        excerpt: "",
        featuredImageUrl: "",
        authorName: "",
        authorEmail: "",
        published: false,
        featured: false,
      });
    },
    onError: (error) => {
      console.error("Failed to create article:", error);
      toast({ title: "Failed to create article", variant: "destructive" });
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id: number) => backend.content.deleteArticle({ id }),
    onSuccess: () => {
      toast({ title: "Article deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
    },
    onError: (error) => {
      console.error("Failed to delete article:", error);
      toast({ title: "Failed to delete article", variant: "destructive" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: CreateCategoryRequest) => backend.content.createCategory(data),
    onSuccess: () => {
      toast({ title: "Category created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      setCategoryForm({ name: "", description: "" });
    },
    onError: (error) => {
      console.error("Failed to create category:", error);
      toast({ title: "Failed to create category", variant: "destructive" });
    },
  });

  const createTagMutation = useMutation({
    mutationFn: (data: CreateTagRequest) => backend.content.createTag(data),
    onSuccess: () => {
      toast({ title: "Tag created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
      setTagForm({ name: "" });
    },
    onError: (error) => {
      console.error("Failed to create tag:", error);
      toast({ title: "Failed to create tag", variant: "destructive" });
    },
  });

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    createArticleMutation.mutate(articleForm);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    createCategoryMutation.mutate(categoryForm);
  };

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    createTagMutation.mutate(tagForm);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="create-article">Create Article</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        {/* Articles List */}
        <TabsContent value="articles">
          <Card>
            <CardHeader>
              <CardTitle>All Articles</CardTitle>
            </CardHeader>
            <CardContent>
              {articlesLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-4">
                  {articles?.articles.map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{article.title}</h3>
                        <p className="text-sm text-gray-600">
                          By {article.authorName} • {new Date(article.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {article.published && <Badge variant="default">Published</Badge>}
                          {article.featured && <Badge variant="secondary">Featured</Badge>}
                          {article.category && <Badge variant="outline">{article.category.name}</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteArticleMutation.mutate(article.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Article */}
        <TabsContent value="create-article">
          <Card>
            <CardHeader>
              <CardTitle>Create New Article</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateArticle} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={articleForm.title}
                      onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={articleForm.categoryId?.toString() || ""}
                      onValueChange={(value) => setArticleForm({ 
                        ...articleForm, 
                        categoryId: value ? parseInt(value) : undefined 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="authorName">Author Name</Label>
                    <Input
                      id="authorName"
                      value={articleForm.authorName}
                      onChange={(e) => setArticleForm({ ...articleForm, authorName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="authorEmail">Author Email</Label>
                    <Input
                      id="authorEmail"
                      type="email"
                      value={articleForm.authorEmail}
                      onChange={(e) => setArticleForm({ ...articleForm, authorEmail: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="featuredImageUrl">Featured Image URL</Label>
                    <Input
                      id="featuredImageUrl"
                      type="url"
                      value={articleForm.featuredImageUrl}
                      onChange={(e) => setArticleForm({ ...articleForm, featuredImageUrl: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="published"
                        checked={articleForm.published}
                        onCheckedChange={(checked) => setArticleForm({ ...articleForm, published: checked })}
                      />
                      <Label htmlFor="published">Published</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={articleForm.featured}
                        onCheckedChange={(checked) => setArticleForm({ ...articleForm, featured: checked })}
                      />
                      <Label htmlFor="featured">Featured</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={articleForm.excerpt}
                    onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={articleForm.content}
                    onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                    rows={10}
                    required
                  />
                </div>

                <Button type="submit" disabled={createArticleMutation.isPending}>
                  {createArticleMutation.isPending ? "Creating..." : "Create Article"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Category</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryName">Name</Label>
                    <Input
                      id="categoryName"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoryDescription">Description</Label>
                    <Textarea
                      id="categoryDescription"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <Button type="submit" disabled={createCategoryMutation.isPending}>
                    <Plus className="h-4 w-4 mr-2" />
                    {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories?.categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        {category.description && (
                          <p className="text-sm text-gray-600">{category.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tags */}
        <TabsContent value="tags">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Tag</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTag} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tagName">Name</Label>
                    <Input
                      id="tagName"
                      value={tagForm.name}
                      onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={createTagMutation.isPending}>
                    <Plus className="h-4 w-4 mr-2" />
                    {createTagMutation.isPending ? "Creating..." : "Create Tag"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags?.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
