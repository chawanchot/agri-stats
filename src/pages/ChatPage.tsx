import { useState, useRef, useEffect } from "react";
import { Input, Button } from "antd";
import { SendOutlined, UserOutlined, RobotOutlined } from "@ant-design/icons";
import axios from "axios";

const { TextArea } = Input;

interface Message {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
}

const ChatPage = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "สวัสดีครับ! พร้อมจะช่วยตอบคำถามเกี่ยวกับข้อมูลเกษตรกรรม มีอะไรให้ช่วยไหมครับ ?",
            sender: "bot",
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<any>(null);

    // Auto scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            const response = await axios.post("https://n8n.mu2f.dev/webhook/agri-chat", {
                message: inputValue,
            });

            console.log(response);

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response.data.output || "ไม่สามารถประมวลผลคำตอบได้",
                sender: "bot",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.log("failed sending message:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950">
            {/* Header */}
            <div className="bg-slate-900/50 border-b border-white/10 px-6 py-4 shadow-lg backdrop-blur-sm"></div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                            {/* Avatar */}
                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                                    msg.sender === "user" ? "bg-gray-400 shadow-lg" : "bg-[#10b962] shadow-lg shadow-green-500/20"
                                }`}
                            >
                                {msg.sender === "user" ? (
                                    <UserOutlined className="text-white" />
                                ) : (
                                    <RobotOutlined className="text-white" />
                                )}
                            </div>

                            {/* Message Bubble */}
                            <div
                                className={`flex-1 max-w-[75%] ${
                                    msg.sender === "user" ? "flex justify-end" : "flex justify-start"
                                }`}
                            >
                                <div
                                    className={`rounded-2xl px-3 py-2 ${
                                        msg.sender === "user"
                                            ? "bg-slate-800/80 text-white rounded-tr-sm shadow-lg"
                                            : "bg-slate-800/80 text-gray-100 shadow-lg rounded-tl-sm"
                                    }`}
                                >
                                    <p className="text-xs leading-relaxed whitespace-pre-wrap wrap-break-word">{msg.text}</p>
                                    <p
                                        className={`text-[10px] mt-1 ${msg.sender === "user" ? "text-blue-200" : "text-gray-500"}`}
                                    >
                                        {msg.timestamp.toLocaleTimeString("th-TH", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#10b962] flex items-center justify-center shadow-lg">
                                <RobotOutlined className="text-white" />
                            </div>
                            <div className="bg-slate-800/80 rounded-2xl rounded-tl-sm px-5 py-3 shadow-lg">
                                <div className="flex items-center h-full gap-1">
                                    <span
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "0ms" }}
                                    ></span>
                                    <span
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "150ms" }}
                                    ></span>
                                    <span
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "300ms" }}
                                    ></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-slate-900/50 border-t border-white/10 px-4 py-4 shadow-lg backdrop-blur-sm">
                <div className="max-w-4xl mx-auto">
                    <div className="flex gap-3 items-end">
                        <TextArea
                            ref={textAreaRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="พิมพ์ข้อความที่นี่..."
                            autoSize={{ minRows: 1, maxRows: 6 }}
                            className="flex-1 text-[15px] px-4 py-3 rounded-xl bg-[#1e293b]! text-white! placeholder:text-white/20! border-none!"
                            disabled={isLoading}
                        />
                        <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={handleSendMessage}
                            loading={isLoading}
                            className="px-6! bg-[#10b962]! border-none font-semibold! rounded-lg! shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                        >
                            ส่ง
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
