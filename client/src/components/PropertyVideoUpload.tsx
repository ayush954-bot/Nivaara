import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { X, Plus, Youtube, Video } from "lucide-react";

interface PropertyVideo {
  id?: number;
  videoUrl: string;
  videoType: "youtube" | "vimeo" | "virtual_tour" | "other";
  displayOrder: number;
}

interface PropertyVideoUploadProps {
  videos: PropertyVideo[];
  onChange: (videos: PropertyVideo[]) => void;
}

export function PropertyVideoUpload({ videos, onChange }: PropertyVideoUploadProps) {
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoType, setNewVideoType] = useState<"youtube" | "vimeo" | "virtual_tour" | "other">("youtube");

  const handleAddVideo = () => {
    if (!newVideoUrl.trim()) return;

    const newVideo: PropertyVideo = {
      videoUrl: newVideoUrl.trim(),
      videoType: newVideoType,
      displayOrder: videos.length,
    };

    onChange([...videos, newVideo]);
    setNewVideoUrl("");
    setNewVideoType("youtube");
  };

  const handleRemoveVideo = (index: number) => {
    const updatedVideos = videos.filter((_, i) => i !== index);
    // Reorder remaining videos
    const reorderedVideos = updatedVideos.map((video, i) => ({
      ...video,
      displayOrder: i,
    }));
    onChange(reorderedVideos);
  };

  const getVideoIcon = (type: string) => {
    switch (type) {
      case "youtube":
        return <Youtube className="h-4 w-4" />;
      case "vimeo":
      case "virtual_tour":
      case "other":
        return <Video className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  const getVideoTypeLabel = (type: string) => {
    switch (type) {
      case "youtube":
        return "YouTube";
      case "vimeo":
        return "Vimeo";
      case "virtual_tour":
        return "Virtual Tour";
      case "other":
        return "Other";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Property Videos</Label>
        <p className="text-xs text-muted-foreground mb-3">
          Add multiple video links (YouTube, Vimeo, virtual tours, etc.)
        </p>

        {/* Add new video form */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Paste video URL..."
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddVideo();
                }
              }}
            />
          </div>
          <Select
            value={newVideoType}
            onValueChange={(value: any) => setNewVideoType(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="vimeo">Vimeo</SelectItem>
              <SelectItem value="virtual_tour">Virtual Tour</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" onClick={handleAddVideo} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* List of added videos */}
        {videos.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <Video className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No videos added yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add video links above to showcase your property
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {videos.map((video, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getVideoIcon(video.videoType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{video.videoUrl}</p>
                    <p className="text-xs text-muted-foreground">
                      {getVideoTypeLabel(video.videoType)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveVideo(index)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
