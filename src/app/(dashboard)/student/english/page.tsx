"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Cần đảm bảo đã cài Textarea
import { 
  BookOpen, Headphones, PenTool, PlayCircle, 
  CheckCircle2, Clock, AlertCircle, Bot 
} from "lucide-react";

export default function EnglishPracticePage() {
  const [activeTab, setActiveTab] = useState("reading");

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      {/* Header Page */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <span className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600">
              <BookOpen size={24} />
            </span>
            IELTS Practice Hub
          </h1>
          <p className="text-stone-500 text-sm mt-1">Luyện tập 3 kỹ năng Reading, Listening & Writing với AI.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-stone-800 px-4 py-2 rounded-full shadow-sm border border-stone-200 dark:border-stone-700">
          <Clock size={16} className="text-red-500" />
          <span className="font-mono font-bold text-stone-700 dark:text-stone-300">45:00</span>
        </div>
      </div>

      {/* TABS CONTAINER */}
      <Tabs defaultValue="reading" className="flex-1 flex flex-col overflow-hidden" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-stone-100 dark:bg-stone-900 p-1">
            <TabsTrigger value="reading" className="data-[state=active]:bg-white data-[state=active]:text-amber-600 font-bold">
              <BookOpen size={16} className="mr-2" /> Reading
            </TabsTrigger>
            <TabsTrigger value="listening" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 font-bold">
              <Headphones size={16} className="mr-2" /> Listening
            </TabsTrigger>
            <TabsTrigger value="writing" className="data-[state=active]:bg-white data-[state=active]:text-rose-600 font-bold">
              <PenTool size={16} className="mr-2" /> Writing Task 2
            </TabsTrigger>
          </TabsList>
          
          <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-lg shadow-amber-900/20">
            Nộp bài & Chấm điểm AI
          </Button>
        </div>

        {/* ================= READING TAB ================= */}
        <TabsContent value="reading" className="flex-1 flex gap-6 overflow-hidden mt-0 h-full">
          {/* Cột trái: Bài đọc (Scrollable) */}
          <Card className="w-1/2 h-full flex flex-col border-stone-200 dark:border-stone-800 shadow-sm">
            <CardHeader className="bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 py-3">
              <CardTitle className="text-lg text-stone-800 dark:text-stone-100">
                Passage 1: The History of Tea
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1 p-6">
              <article className="prose dark:prose-invert max-w-none text-stone-700 dark:text-stone-300 leading-relaxed font-serif text-lg">
                <p>The story of tea begins in China. According to legend, in 2737 BC, the Chinese emperor Shen Nung was sitting beneath a tree while his servant boiled drinking water, when some leaves from the tree blew into the water. Shen Nung, a renowned herbalist, decided to try the infusion that his servant had accidentally created...</p>
                <p className="mt-4">Tea containers have been found in tombs dating from the Han dynasty (206 BC - 220 AD) but it was under the Tang dynasty (618-906 AD), that tea became firmly established as the national drink of China.</p>
                <p className="mt-4">It became such a favorite that during the late eighth century a writer called Lu Yu wrote the first book entirely about tea, the Ch'a Ching, or Tea Classic. It was shortly after this that tea was first introduced to Japan, by Japanese Buddhist monks who had travelled to China to study...</p>
                <p className="mt-4">[... Nội dung bài đọc dài sẽ cuộn ở đây ...]</p>
                <p className="mt-4">Tea containers have been found in tombs dating from the Han dynasty (206 BC - 220 AD) but it was under the Tang dynasty (618-906 AD), that tea became firmly established as the national drink of China.</p>
              </article>
            </ScrollArea>
          </Card>

          {/* Cột phải: Câu hỏi Trắc nghiệm */}
          <Card className="w-1/2 h-full flex flex-col border-stone-200 dark:border-stone-800 shadow-sm bg-[#fcfaf8] dark:bg-[#151311]">
             <CardHeader className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 py-3 flex flex-row justify-between items-center">
              <CardTitle className="text-lg text-stone-800 dark:text-stone-100">Questions 1-5</CardTitle>
              <Badge variant="outline" className="text-amber-600 border-amber-200">Multiple Choice</Badge>
            </CardHeader>
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-8">
                {/* Question 1 */}
                <div className="space-y-4">
                  <h3 className="font-bold text-stone-800 dark:text-stone-200 text-md">
                    <span className="bg-stone-200 dark:bg-stone-800 px-2 py-1 rounded mr-2">1</span>
                    According to legend, tea was discovered by:
                  </h3>
                  <RadioGroup defaultValue="option-one" className="space-y-2">
                    {["A servant boiling water", "Emperor Shen Nung", "Japanese Buddhist monks", "Lu Yu"].map((opt, i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border border-stone-200 hover:bg-white hover:border-amber-400 cursor-pointer transition-all">
                        <RadioGroupItem value={`opt-${i}`} id={`q1-opt-${i}`} />
                        <Label htmlFor={`q1-opt-${i}`} className="flex-1 cursor-pointer font-medium text-stone-600 dark:text-stone-400">{opt}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                 {/* Question 2 */}
                 <div className="space-y-4">
                  <h3 className="font-bold text-stone-800 dark:text-stone-200 text-md">
                    <span className="bg-stone-200 dark:bg-stone-800 px-2 py-1 rounded mr-2">2</span>
                    When did tea become the national drink of China?
                  </h3>
                  <RadioGroup className="space-y-2">
                    {["Han Dynasty", "Tang Dynasty", "2737 BC", "Late eighth century"].map((opt, i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border border-stone-200 hover:bg-white hover:border-amber-400 cursor-pointer transition-all">
                        <RadioGroupItem value={`opt-${i}`} id={`q2-opt-${i}`} />
                        <Label htmlFor={`q2-opt-${i}`} className="flex-1 cursor-pointer font-medium text-stone-600 dark:text-stone-400">{opt}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        {/* ================= LISTENING TAB ================= */}
        <TabsContent value="listening" className="flex-1 flex flex-col mt-0 h-full">
          {/* Audio Player Bar */}
          <div className="bg-blue-600 text-white p-4 rounded-xl flex items-center gap-4 shadow-md mb-4">
            <Button size="icon" className="rounded-full bg-white text-blue-600 hover:bg-blue-50">
              <PlayCircle size={24} />
            </Button>
            <div className="flex-1">
              <div className="text-xs font-bold opacity-80 mb-1">SECTION 1 - AUDIO TRACK</div>
              <div className="h-2 bg-blue-900/30 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="font-mono text-sm font-bold">04:12</div>
          </div>

          <div className="flex gap-6 flex-1 overflow-hidden">
             {/* Note / Context bên trái */}
             <Card className="w-1/3 h-full overflow-hidden">
                <CardHeader className="bg-blue-50/50 pb-2">
                  <CardTitle className="text-blue-700">Notes & Context</CardTitle>
                </CardHeader>
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4 text-sm text-stone-600">
                     <p><strong>Topic:</strong> Booking a holiday trip.</p>
                     <p><strong>Speakers:</strong> Travel agent (female) and Customer (male).</p>
                     <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 flex gap-2">
                        <AlertCircle size={16} />
                        <span>Chú ý nghe kỹ tên người và số điện thoại.</span>
                     </div>
                  </div>
                </ScrollArea>
             </Card>

             {/* Câu hỏi bên phải */}
             <Card className="flex-1 h-full overflow-hidden border-stone-200">
                <CardHeader>
                   <CardTitle>Questions 1-10</CardTitle>
                </CardHeader>
                <ScrollArea className="h-full p-6">
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <Label className="font-bold">1. The customer wants to go to:</Label>
                         <RadioGroup className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center space-x-2 border p-3 rounded-md"><RadioGroupItem value="a" id="l1a"/><Label htmlFor="l1a">Paris</Label></div>
                            <div className="flex items-center space-x-2 border p-3 rounded-md"><RadioGroupItem value="b" id="l1b"/><Label htmlFor="l1b">London</Label></div>
                         </RadioGroup>
                      </div>
                      <div className="space-y-2">
                         <Label className="font-bold">2. Maximum budget per person:</Label>
                         <RadioGroup className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center space-x-2 border p-3 rounded-md"><RadioGroupItem value="a" id="l2a"/><Label htmlFor="l2a">$500</Label></div>
                            <div className="flex items-center space-x-2 border p-3 rounded-md"><RadioGroupItem value="b" id="l2b"/><Label htmlFor="l2b">$1000</Label></div>
                         </RadioGroup>
                      </div>
                   </div>
                </ScrollArea>
             </Card>
          </div>
        </TabsContent>

        {/* ================= WRITING TAB ================= */}
        <TabsContent value="writing" className="flex-1 flex gap-6 mt-0 h-full overflow-hidden">
          {/* Đề bài bên trái */}
          <Card className="w-1/3 h-full flex flex-col border-stone-200 shadow-sm">
             <CardHeader className="bg-rose-50 border-b border-rose-100">
                <CardTitle className="text-rose-700 flex items-center gap-2">
                   <PenTool size={18} /> Writing Task 2
                </CardTitle>
             </CardHeader>
             <div className="p-6 flex-1 bg-white">
                <h3 className="font-bold text-lg mb-4 text-stone-800">Prompt:</h3>
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 italic leading-relaxed mb-6">
                   "Some people believe that the best way to solve environmental problems is to increase the price of fuel. To what extent do you agree or disagree?"
                </div>
                <div className="space-y-2 text-sm text-stone-500">
                   <p className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500"/> Write at least 250 words.</p>
                   <p className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500"/> Give reasons for your answer.</p>
                   <p className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500"/> Include relevant examples.</p>
                </div>
             </div>
          </Card>

          {/* Khu vực soạn thảo bên phải */}
          <Card className="flex-1 h-full flex flex-col border-stone-200 shadow-sm relative">
             <div className="absolute top-4 right-4 z-10">
                <Badge variant="outline" className="bg-white">Words: 0</Badge>
             </div>
             <Textarea 
                placeholder="Start typing your essay here..." 
                className="flex-1 resize-none border-0 focus-visible:ring-0 text-lg p-6 leading-relaxed font-serif"
             />
             <div className="p-4 border-t bg-stone-50 flex justify-between items-center">
                <span className="text-xs text-stone-400">Last saved: Just now</span>
                <Button className="bg-rose-600 hover:bg-rose-700 text-white">
                   <Bot className="mr-2 h-4 w-4" /> AI Grading (Band Score)
                </Button>
             </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}