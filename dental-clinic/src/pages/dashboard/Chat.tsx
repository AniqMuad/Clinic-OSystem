import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useListChatMessages, useSendChatMessage, getListChatMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Send, AlertCircle } from "lucide-react";

export default function Chat() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messagesResponse, isLoading } = useListChatMessages(
    { limit: 100 },
    { query: { queryKey: getListChatMessagesQueryKey({ limit: 100 }), refetchInterval: 3000 } } // Poll every 3s
  );

  const messages = Array.isArray(messagesResponse) ? messagesResponse : (messagesResponse as any)?.messages || [];
  const sendMessage = useSendChatMessage();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessage.mutate({ data: { message, isEmergency } }, {
      onSuccess: () => {
        setMessage("");
        setIsEmergency(false);
        queryClient.invalidateQueries({ queryKey: getListChatMessagesQueryKey() });
      }
    });
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto h-[calc(100vh-6rem)]">
      <div className="flex justify-between items-center pb-4 border-b shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Internal Chat</h1>
          <p className="text-sm text-muted-foreground">Communicate with staff across the clinic.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10 rounded-xl my-4 border">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className="flex gap-2 max-w-[70%]">
                {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
                <Skeleton className={`h-16 rounded-2xl ${i % 2 === 0 ? 'w-48 rounded-tl-none' : 'w-64 rounded-tr-none'}`} />
              </div>
            </div>
          ))
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg: any) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-4`}>
                <div className="flex items-baseline gap-2 mb-1 px-1">
                  {!isMe && <span className="text-xs font-semibold text-foreground/80">{msg.senderName}</span>}
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(msg.createdAt), "HH:mm")}
                  </span>
                </div>
                <div className={`
                  relative px-4 py-2.5 rounded-2xl max-w-[80%] md:max-w-[70%] text-sm shadow-sm
                  ${isEmergency 
                    ? 'bg-red-500 text-white border-red-600' 
                    : isMe 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-white border rounded-tl-sm'
                  }
                `}>
                  {msg.isEmergency && (
                    <div className="flex items-center gap-1 text-xs font-bold uppercase mb-1 bg-white/20 w-fit px-2 py-0.5 rounded text-white">
                      <AlertCircle className="w-3 h-3" /> Emergency
                    </div>
                  )}
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 bg-white border rounded-xl p-3 shadow-sm">
        <form onSubmit={handleSend} className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <Switch 
                id="emergency" 
                checked={isEmergency} 
                onCheckedChange={setIsEmergency}
                className="data-[state=checked]:bg-red-500" 
              />
              <Label htmlFor="emergency" className={`text-sm cursor-pointer ${isEmergency ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                Emergency Broadcast
              </Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-muted/20 border-border h-12"
            />
            <Button 
              type="submit" 
              className={`h-12 w-12 shrink-0 ${isEmergency ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
              disabled={sendMessage.isPending || !message.trim()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
