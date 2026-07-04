"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, Loader2, Copy, Check, BookOpen, Search, Code, Cpu } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// --- Custom Markdown Components ---
const CodeBlock = ({ inline, className, children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const codeString = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="relative group rounded-md overflow-hidden my-6 border border-slate-700/50 shadow-lg">
        <div className="flex justify-between items-center bg-slate-800/80 px-4 py-1.5 text-xs text-slate-400 border-b border-slate-700/50 backdrop-blur-md">
          <span className="font-mono uppercase tracking-wider">{match[1]}</span>
          <button
            onClick={handleCopy}
            className="hover:text-indigo-300 transition-colors flex items-center gap-1.5 bg-slate-700/50 hover:bg-slate-700 px-2 py-0.5 rounded"
            title="Copy code"
          >
            {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          customStyle={{ margin: 0, borderRadius: "0 0 0.375rem 0.375rem", background: "#0f111a", padding: "1rem" }}
          {...props}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  }
  return (
    <code className="bg-indigo-900/40 text-indigo-200 px-1.5 py-0.5 rounded text-[0.875em] font-mono border border-indigo-500/20" {...props}>
      {children}
    </code>
  );
};

const CustomP = ({ children }: any) => {
  // Lighter metadata styling for Evidence/Grounded
  const textContent = React.Children.toArray(children).join("");
  if (textContent.includes("Evidence:") || textContent.includes("Grounded in:")) {
    return <p className="text-[14px] text-slate-400 my-1 font-medium">{children}</p>;
  }
  return <p className="mb-4 last:mb-0 leading-relaxed text-[16px]">{children}</p>;
};

const CustomHr = () => <hr className="my-6 border-slate-700/50" />;
// ------------------------------------

const AIMessageBar = () => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [sessionId, setSessionId] = useState<string>("default");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    let savedSession = localStorage.getItem("moiSessionId");
    if (!savedSession) {
      savedSession = typeof crypto !== "undefined" && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2, 15);
      localStorage.setItem("moiSessionId", savedSession);
    }
    setSessionId(savedSession);

    const savedMessages = localStorage.getItem("moiChatMessages");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to parse saved messages", e);
      }
    }
  }, []);

  // Save messages to localStorage on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("moiChatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  // Animated loading states
  const loadingMessages = ["Thinking...", "Searching documentation...", "Generating answer..."];
  const [loadingText, setLoadingText] = useState(loadingMessages[0]);

  useEffect(() => {
    if (!isTyping) return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % loadingMessages.length;
      setLoadingText(loadingMessages[i]);
    }, 1500);
    return () => clearInterval(interval);
  }, [isTyping, loadingMessages.length]);

  const suggestedQuestions = [
    { icon: BookOpen, text: "What is MOI?" },
    { icon: Cpu, text: "How do I register an agent?" },
    { icon: Sparkles, text: "Explain MAS0" },
    { icon: Code, text: "Explain LogicFactory" },
  ];

  // Fetch response from backend
  const fetchResponse = async (userMessage: string) => {
    setIsTyping(true);
    setLoadingText(loadingMessages[0]);
    
    try {
      const res = await fetch("http://localhost:3940/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: userMessage,
          sessionId: sessionId,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      setIsTyping(false); // Stop loading spinner as soon as stream connects
      
      // Add empty message that we will stream into
      setMessages((prev) => [...prev, { text: "", isUser: false }]);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          // Keep the last partial line in the buffer
          buffer = lines.pop() || "";
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));
                if (data.done) break;
                if (data.text) {
                  setMessages((prev) => {
                    const newArr = [...prev];
                    const lastIdx = newArr.length - 1;
                    newArr[lastIdx] = { ...newArr[lastIdx], text: newArr[lastIdx].text + data.text };
                    return newArr;
                  });
                }
              } catch (e) {
                // Ignore parse errors from partial chunks if any
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch response:", error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, I'm having trouble connecting to the server. Please try again later.", isUser: false },
      ]);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (input.trim() === "") return;
    
    const userMessage = input;
    setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
    setInput("");
    
    await fetchResponse(userMessage);
  };

  const handleSuggestedClick = (text: string) => {
    setMessages((prev) => [...prev, { text, isUser: true }]);
    fetchResponse(text);
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="w-full max-w-5xl mx-auto h-[700px] bg-gradient-to-br from-slate-900 to-[#0a0f1c] rounded-xl overflow-hidden shadow-2xl border border-indigo-500/20 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-md p-4 border-b border-indigo-500/20 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600/20 p-2 rounded-lg border border-indigo-500/30">
            <Sparkles className="text-indigo-400 h-5 w-5" />
          </div>
          <div>
            <h2 className="text-white font-medium">MOI Ecosystem Mentor</h2>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-all"
          title="Clear Chat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {/* Messages container */}
      <div className="p-4 flex-1 overflow-y-auto bg-slate-900/40">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto animate-fade-in">
            <div className="bg-indigo-900/30 p-4 rounded-2xl border border-indigo-500/20 mb-6 shadow-inner">
              <Sparkles className="h-10 w-10 text-indigo-400" />
            </div>
            <h3 className="text-white text-2xl font-medium mb-3">Welcome to the MOI Mentor</h3>
            <p className="text-slate-400 text-center mb-8 text-[16px]">
              I'm an AI assistant trained on the official MOI Ecosystem documentation. Ask me anything to get started.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedClick(q.text)}
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:bg-indigo-900/40 hover:border-indigo-500/40 transition-all text-left group shadow-sm"
                >
                  <div className="text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    <q.icon className="h-5 w-5" />
                  </div>
                  <span className="text-slate-200 text-sm font-medium">{q.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 pb-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
              >
                {/* Avatar for AI */}
                {!msg.isUser && (
                  <div className="flex-shrink-0 mr-3 mt-1">
                    <div className="bg-indigo-900/50 border border-indigo-500/30 rounded-full p-2 shadow-sm">
                      <Sparkles className="h-4 w-4 text-indigo-300" />
                    </div>
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] ${
                    msg.isUser
                      ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-md"
                      : "bg-slate-800/80 text-slate-100 rounded-2xl rounded-tl-sm px-6 py-5 border border-slate-700/60 shadow-lg"
                  } animate-fade-in`}
                >
                  {msg.isUser ? (
                    <p className="text-[16px] leading-relaxed">{msg.text}</p>
                  ) : (
                    <div className="prose prose-invert prose-indigo max-w-none prose-p:text-[16px] prose-p:leading-relaxed prose-headings:text-slate-100 prose-h1:text-[20px] prose-h2:text-[18px] prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code: CodeBlock,
                          p: CustomP,
                          hr: CustomHr,
                          a: ({node, ...props}) => {
                             return <a {...props} className="font-medium text-indigo-400 transition-colors" />
                          }
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start items-end animate-fade-in mt-4">
                <div className="flex-shrink-0 mr-3 mb-1">
                  <div className="bg-indigo-900/30 border border-indigo-500/20 rounded-full p-2">
                    <Sparkles className="h-4 w-4 text-indigo-400/70" />
                  </div>
                </div>
                <div className="bg-slate-800/60 rounded-2xl rounded-tl-sm px-5 py-4 border border-slate-700/40 flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  <span className="text-sm text-indigo-200/80 animate-pulse">{loadingText}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input form */}
      <form 
        onSubmit={handleSubmit}
        className={`p-4 shrink-0 border-t ${isFocused ? 'border-indigo-500/50 bg-slate-800/90' : 'border-slate-800 bg-slate-900'} transition-all duration-300 z-10`}
      >
        <div className="relative flex items-center max-w-4xl mx-auto shadow-sm group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask about MOI, Cocolang, or Agent Registry..."
            className="w-full bg-slate-950/50 border border-slate-700 rounded-full py-3.5 pl-5 pr-14 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/70 focus:border-indigo-500/70 transition-all text-[16px]"
          />
          <button
            type="submit"
            disabled={input.trim() === "" || isTyping}
            className={`absolute right-1.5 rounded-full p-2.5 ${
              input.trim() === "" || isTyping
                ? "text-slate-600 bg-transparent cursor-not-allowed"
                : "text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-900/20"
            } transition-all`}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="text-center mt-3">
          <span className="text-[12px] text-slate-500 font-medium tracking-wide">AI Mentor can make mistakes. Verify information from official MOI docs.</span>
        </div>
      </form>
      
      <style>
        {`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        /* Custom scrollbar for markdown content */
        .prose pre::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .prose pre::-webkit-scrollbar-track {
          background: transparent;
        }
        .prose pre::-webkit-scrollbar-thumb {
          background-color: rgba(99, 102, 241, 0.3);
          border-radius: 4px;
        }
        .prose pre::-webkit-scrollbar-thumb:hover {
          background-color: rgba(99, 102, 241, 0.5);
        }
        `}
      </style>
    </div>
  );
};

export default AIMessageBar;
