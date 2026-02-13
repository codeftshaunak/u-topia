export const dynamic = "force-dynamic";


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Search, 
  Filter,
  MoreVertical,
  Download,
  Share,
  File,
  FileText,
  Image,
  Video,
  Archive,
  Eye,
  Calendar,
  User,
  FolderOpen,
  Grid,
  List
} from "lucide-react";

const files = [
  {
    id: 1,
    name: "Business Plan 2024.pdf",
    type: "pdf",
    size: "2.4 MB",
    uploadedBy: "John Smith",
    uploadedAt: "2 hours ago",
    shared: true,
    downloads: 5,
    category: "Business Documents"
  },
  {
    id: 2,
    name: "Market Research Analysis.xlsx",
    type: "spreadsheet",
    size: "1.8 MB",
    uploadedBy: "Sarah Chen",
    uploadedAt: "1 day ago",
    shared: false,
    downloads: 12,
    category: "Research"
  },
  {
    id: 3,
    name: "Product Demo Video.mp4",
    type: "video",
    size: "45.2 MB",
    uploadedBy: "Alex Johnson",
    uploadedAt: "3 days ago",
    shared: true,
    downloads: 8,
    category: "Marketing"
  },
  {
    id: 4,
    name: "Team Photo.jpg",
    type: "image",
    size: "3.1 MB",
    uploadedBy: "Emma Davis",
    uploadedAt: "5 days ago",
    shared: true,
    downloads: 15,
    category: "Team"
  },
  {
    id: 5,
    name: "Financial Projections.pdf",
    type: "pdf",
    size: "890 KB",
    uploadedBy: "Mike Rodriguez",
    uploadedAt: "1 week ago",
    shared: false,
    downloads: 3,
    category: "Finance"
  },
  {
    id: 6,
    name: "Legal Documents.zip",
    type: "archive",
    size: "12.4 MB",
    uploadedBy: "David Kim",
    uploadedAt: "2 weeks ago",
    shared: false,
    downloads: 2,
    category: "Legal"
  },
];

const categories = ["All Files", "Business Documents", "Research", "Marketing", "Finance", "Legal", "Team"];

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <FileText className="h-8 w-8 text-red-500" />;
    case 'spreadsheet':
      return <File className="h-8 w-8 text-green-500" />;
    case 'video':
      return <Video className="h-8 w-8 text-purple-500" />;
    case 'image':
      return <Image className="h-8 w-8 text-blue-500" />;
    case 'archive':
      return <Archive className="h-8 w-8 text-orange-500" />;
    default:
      return <File className="h-8 w-8 text-gray-500" />;
  }
};

export default function Files() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Files & Resources</h1>
          <p className="text-muted-foreground">Share and access team documents and resources</p>
        </div>
        <Button className="bg-gradient-accent">
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
      </div>

      {/* Upload Area */}
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Drop files here to upload</h3>
              <p className="text-muted-foreground">Or click to browse from your computer</p>
            </div>
            <Button variant="outline">
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.length}</div>
            <p className="text-xs text-muted-foreground">+{files.filter(f => f.uploadedAt.includes('hours') || f.uploadedAt.includes('day')).length} this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67.8 MB</div>
            <p className="text-xs text-muted-foreground">of 1 GB available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Shared Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.filter(f => f.shared).length}</div>
            <p className="text-xs text-muted-foreground">Public to team</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.reduce((acc, f) => acc + f.downloads, 0)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  className="pl-10 w-80"
                />
              </div>
              <select className="border border-border rounded-md px-3 py-2 text-sm bg-background">
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <List className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Files</CardTitle>
          <CardDescription>Files shared with your accountability group</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{file.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{file.size}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{file.uploadedBy}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{file.uploadedAt}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Download className="h-3 w-3" />
                        <span>{file.downloads} downloads</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={file.shared ? 'default' : 'secondary'}>
                      {file.shared ? 'Shared' : 'Private'}
                    </Badge>
                    <Badge variant="outline">{file.category}</Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Folder Structure</CardTitle>
          <CardDescription>Organize your files in folders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(1).map((category) => (
              <div key={category} className="flex flex-col items-center p-4 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer">
                <FolderOpen className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm font-medium text-center">{category}</span>
                <span className="text-xs text-muted-foreground">
                  {files.filter(f => f.category === category).length} files
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}