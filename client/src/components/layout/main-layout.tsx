import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ChatWindow } from "@/components/chat/chat-window";
import { Sidebar } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, BarChart2, TrendingUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function MainLayout() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-background text-foreground overscroll-none">
        <Tabs defaultValue="markets" className="h-full flex flex-col">
          <TabsList className="fixed top-0 left-0 right-0 justify-between px-2 h-12 shrink-0 z-50 bg-background/80 backdrop-blur-sm border-b">
            <TabsTrigger value="markets" className="flex-1">Markets</TabsTrigger>
            <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
            <TabsTrigger value="insights" className="flex-1">Insights</TabsTrigger>
          </TabsList>

          <TabsContent 
            value="markets" 
            className="flex-1 m-0 h-[calc(100%-3rem)] mt-12 w-full overscroll-contain"
          >
            <div className="h-full overflow-y-auto -webkit-overflow-scrolling-touch">
              <div className="w-full pb-4">
                <Sidebar className="w-full" />
              </div>
            </div>
          </TabsContent>

          <TabsContent 
            value="chat" 
            className="flex-1 m-0 h-[calc(100%-3rem)] mt-12 overscroll-contain"
          >
            <div className="h-full overflow-y-auto -webkit-overflow-scrolling-touch">
              <div className="flex flex-col px-4 pt-4 pb-4">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary/90 to-primary/60 bg-clip-text text-transparent">
                    AI Trading Assistant
                  </h1>
                  <div className="flex gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <BarChart2 className="w-4 h-4 text-muted-foreground" />
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <Card className="flex-1 border-0 shadow-lg bg-glass overflow-hidden">
                  <ChatWindow />
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent 
            value="insights" 
            className="flex-1 m-0 h-[calc(100%-3rem)] mt-12 overscroll-contain"
          >
            <div className="h-full overflow-y-auto -webkit-overflow-scrolling-touch">
              <div className="w-full px-4 py-4">
                <h2 className="text-lg font-semibold mb-4 text-primary/90">Market Insights</h2>
                <div className="space-y-4 pb-6">
                  <Card className="p-4 bg-glass hover:bg-accent/5 transition-colors cursor-pointer border-primary/20">
                    <h3 className="font-medium mb-2">Latest Market Updates</h3>
                    <p className="text-sm text-muted-foreground">
                      Real-time news and social insights will appear here...
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <ScrollArea className="h-full bg-sidebar">
            <Sidebar />
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={50}>
          <div className="h-full p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary/90 to-primary/60 bg-clip-text text-transparent">
                AI Trading Assistant
              </h1>
              <div className="flex gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <BarChart2 className="w-5 h-5 text-muted-foreground" />
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
            <Card className="flex-1 border-0 shadow-lg bg-glass">
              <ChatWindow />
            </Card>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
          <ScrollArea className="h-full">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4 text-primary/90">Market Insights</h2>
              <div className="space-y-4">
                <Card className="p-4 bg-glass hover:bg-accent/5 transition-colors cursor-pointer border-primary/20">
                  <h3 className="font-medium mb-2">Latest Market Updates</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time news and social insights will appear here...
                  </p>
                </Card>
              </div>
            </div>
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}