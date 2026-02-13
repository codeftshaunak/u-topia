export const dynamic = "force-dynamic";


import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Megaphone,
  FileText,
  Calendar,
  ExternalLink
} from "lucide-react";

// Thumbnails
const thumbReport = "/thumb-report.jpg";
const thumbFunding = "/thumb-funding.jpg";
const thumbDefi = "/thumb-defi.jpg";
const thumbWelcome = "/thumb-welcome.jpg";
const thumbWhitepaper = "/thumb-whitepaper.jpg";
const thumbBrand = "/thumb-brand.jpg";
const thumbQa = "/thumb-qa.jpg";
const thumbRoadmap = "/thumb-roadmap.jpg";
const thumbMeeting = "/thumb-meeting.jpg";

const channels = [
  { 
    id: "announcements", 
    name: "Announcements", 
    icon: Megaphone,
    description: "Official updates from U-topia"
  },
  { 
    id: "u-topia-materials", 
    name: "U-Topia Materials", 
    icon: FileText,
    description: "Resources, guides, and documentation"
  },
  { 
    id: "events-calendar", 
    name: "Events Calendar", 
    icon: Calendar,
    description: "Upcoming events and meetings"
  },
];

const channelContent: Record<string, Array<{
  id: number;
  title: string;
  content: string;
  date: string;
  type: "announcement" | "resource" | "event";
  link?: string;
  thumbnail: string;
}>> = {
  "announcements": [
    {
      id: 1,
      title: "Q4 2024 Shareholder Report Released",
      content: "We are pleased to share our Q4 2024 performance report. Review our quarterly metrics, strategic initiatives, and roadmap for 2025.",
      date: "Dec 8, 2024",
      type: "announcement",
      thumbnail: thumbReport
    },
    {
      id: 2,
      title: "U-topia Secures Series B Funding",
      content: "We are thrilled to announce $50M in Series B funding to accelerate our mission of building the bank of the future.",
      date: "Dec 5, 2024",
      type: "announcement",
      thumbnail: thumbFunding
    },
    {
      id: 3,
      title: "New Digital Asset Features Coming Q1 2025",
      content: "Exciting new cryptocurrency integration and DeFi features are on the roadmap for early next year.",
      date: "Dec 2, 2024",
      type: "announcement",
      thumbnail: thumbDefi
    },
  ],
  "u-topia-materials": [
    {
      id: 1,
      title: "Shareholder Welcome Kit",
      content: "Everything you need to know as a U-topia shareholder. Includes governance, voting rights, and communication channels.",
      date: "Nov 15, 2024",
      type: "resource",
      link: "#",
      thumbnail: thumbWelcome
    },
    {
      id: 2,
      title: "U-Coin Tokenomics Whitepaper",
      content: "Detailed breakdown of U-Coin utility, distribution, and ecosystem integration.",
      date: "Nov 10, 2024",
      type: "resource",
      link: "#",
      thumbnail: thumbWhitepaper
    },
    {
      id: 3,
      title: "Brand Guidelines & Assets",
      content: "Official U-topia logos, colors, and brand usage guidelines for shareholders and partners.",
      date: "Oct 28, 2024",
      type: "resource",
      link: "#",
      thumbnail: thumbBrand
    },
  ],
  "events-calendar": [
    {
      id: 1,
      title: "Shareholder Q&A Session",
      content: "Live Q&A with the leadership team. Submit your questions in advance.",
      date: "Dec 12, 2024 • 3:00 PM EST",
      type: "event",
      thumbnail: thumbQa
    },
    {
      id: 2,
      title: "Product Roadmap Preview",
      content: "Exclusive look at upcoming features and 2025 product strategy.",
      date: "Dec 18, 2024 • 10:00 AM EST",
      type: "event",
      thumbnail: thumbRoadmap
    },
    {
      id: 3,
      title: "Annual Shareholder Meeting",
      content: "Virtual annual meeting with voting on key proposals and board updates.",
      date: "Jan 15, 2025 • 2:00 PM EST",
      type: "event",
      thumbnail: thumbMeeting
    },
  ],
};

export default function Messages() {
  const [selectedChannel, setSelectedChannel] = useState("announcements");
  const currentChannel = channels.find(c => c.id === selectedChannel);
  const content = channelContent[selectedChannel] || [];

  return (
    <div className="h-[calc(100vh-2rem)] flex">
      {/* Channel List */}
      <div className="w-72 border-r bg-card flex-shrink-0">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Channels</h2>
          <p className="text-xs text-muted-foreground">Stay informed with updates</p>
        </div>

        <div className="p-2">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel.id)}
              className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                selectedChannel === channel.id
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <channel.icon className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{channel.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {channel.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-4 border-b bg-card">
          <div className="flex items-center gap-3">
            {currentChannel && <currentChannel.icon className="h-5 w-5 text-muted-foreground" />}
            <div>
              <h2 className="font-semibold">{currentChannel?.name}</h2>
              <p className="text-sm text-muted-foreground">{currentChannel?.description}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {content.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                <div className="flex">
                  {/* Thumbnail */}
                  <div className="w-40 h-28 flex-shrink-0 overflow-hidden">
                    <img 
                      src={item.thumbnail} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {/* Content */}
                  <CardContent className="p-4 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.type === "announcement" && "Announcement"}
                        {item.type === "resource" && "Resource"}
                        {item.type === "event" && "Event"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                  </CardContent>
                  {item.link && (
                    <div className="p-4 flex items-center">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
