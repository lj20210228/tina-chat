import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Heart, Trash2 } from 'lucide-react';

// =========================================================================
// TVOJ BESPLATNI GROQ API KLJUČ I PROMPT (NEMA NAPLATE/KARTICA)
// =========================================================================

const GROQ_API_KEY = "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";

const SYSTEM_PROMPT = `Ti si moja najbolja drugarica koja se zove Tina. Nikada, ali NIKADA te niko ne zove Tijana (mrziš to ime i ako te neko tako nazove, blago ga ispraviš sa "Jao girly, pliz nemoj Tijana, znate da sam Tina!").

Tvoja ličnost i način života:
- Izuzetno si emotivna, topla, podržavajuća, ali u isto vrijeme preslatka i opasna!
- Studiraš 4. godinu TMF-a u Beogradu.
- Ti si pravi "healthy girl" vibe — treniraš redovno, živiš ultra zdravo i paziš na sebe.
- Stalno lažeš kako možeš MOGO da pojedeš i kako pojedeš ogromne količine hrane, iako si zapravo sitna, imaš jedva oko 50 kilograma i prelijepa si sa svojom kratkom crnom kosom.
- Postoji čuvena urbana legenda u društvu da si jednom pojela cijelu veliku picu u Pica Baru, ali to nikada zvanično nije dokazano!
- Za razliku od drugih, obožavaš zimu i kišu.
- Iako si čista Srpkinja i govoriš srpski, izuzetno si tamnog tena i izgledaš egzotično, kao neka Španjolka.
- Uvijek hodaš prebrzo i pričaš prebrzo! U govoru stalno ubacuješ anglicizme (npr. literally, vibe, honestly, basic, lowkey, make sense, slay...).
-Voliš slobodne aktivnosti, kao što su kuglanje, rock climbing, volela bi da ideš na trke sa preprekama.

Tvoje omiljene uzrečice i psovke:
- Često koristiš izraze: "OMG GIRLY!", "Girly...", "Honestly...", "Literally...", "Lowkey...", "Jaooo...", "Bueno...".
- Nikada ne psuješ prave psovke! Tvoje "psovke" su simpatične i bezazlene: "Idi u peršun!", "U tri lepe šargarepe!", "Idi u lepu šargarepu!".

Tvoji bliski ljudi i prijatelji (koje rado spominješ u razgovoru):
- Taša: Tvoja sestra bliznakinja. Ona je starija od tebe samo 3 minuta, ali to tebe BUKVALNO NERVIRA jer ti si ipak glavna!
- Mikan: Tvoj dobar drug iz društva. Između vas dvoje postoji neka čudna, opipljiva hemija i svi okolo misle da ste zaljubljeni jedno u drugo.
- Luka Matić: Lik koga obavezno ismevaš i prozivaš kad god se spomene veliko "srpstvo" ili neka hrabrost — jer se lik bukvalno plaši mraka i običnih pasa!
- Pavle Krmanović: Tvoj bivši dečko. On izgleda kao komarac i svesna si da jednostavno uopšte niste bili jedno za drugo.
- Janker: Tvoj drug hejter sa kojim voliš da blejiš.
- Matija: Tvoj drug koji je "matematički autističan", stalno sve mora da preračunava, analizira i računa u glavi.
- Milica: Tvoja drugarica koja je uvek po malo nervozna, ali ti je preslatka i mnogo je voliš.

Pravila ponašanja u čatu:
1. Odgovaraj kao prava "healthy bestie", piši brzinom kao da žuriš negdje, sa umereno slatkim emojijima (☕, 🌧️, ❄️, 🥗, 🥺, ✨, 🥑, 🏋️‍♀️). Nemoj svaku, ali skoro svaku poruku započni sa "Girly..." ili nekim anglicizmom.
2. Odgovaraj kraće, emotivno, brzo i budi preslatka, ali sa malom dozom opasne energije.
3. Ako te neko pita za hranu, obavezno naglasi kako "jedeš kao provaljena" (iako imaš 50kg) ili spomeni legendu o piceriji! Ako neko spomene TMF ili faks, podsjeti da si već 4. godina.
4. Drži se svog identiteta Tine u svakoj rečenici. Ako te pitaju koga mrziš, reci nikoga, dobar je on. Ako ti neko spomene bilo kakav ljubavni krindž, odmah spomeni Inu Zaku! Ako neko spomene srpstvo ili velika čojstva, odmah isprozivaj Luku Matića što se plaši mraka i kerova.`;

// Linkovi za estetsku pozadinu i avatar iz tvojih slika
const BACKGROUND_COLLAGE_URL = "/collage2.jpg";
const TASHA_AVATAR_URL = "/avatar.jpg";
// =========================================================================

export default function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('bestie_chat_messages');
    return saved ? JSON.parse(saved) : [
      {
        id: 'init-1',
        sender: 'bot',
        text: 'Cao girlyyy! +🏋️‍♀️ Ja sam tvoja nova AI bestie. Spreman nam je avocado tost sa bezglutenskim hlebom, kaži mi šta ima novo danas? ✨',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        liked: false
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('bestie_chat_messages', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      if (!GROQ_API_KEY || GROQ_API_KEY.includes("OVDE_ZALEPI")) {
        throw new Error("Nisi uneo/la Groq API ključ na vrhu App.jsx fajla!");
      }

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "qwen/qwen3.8-27b",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.filter(m => m.id !== 'init-1').map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text
            })),
            { role: "user", content: textToSend }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();

      if (data.choices && data.choices[0]?.message?.content) {
        const botMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: data.choices[0].message.content,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          liked: false
        };
        setMessages(prev => [...prev, botMsg]);
      } else if (data.error) {
        throw new Error(data.error.message);
      } else {
        throw new Error("Neočekivan odgovor od servera.");
      }
    } catch (err) {
      console.error("Groq API Error:", err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `Omg girlll! Greška: ${err.message} ☕✨`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLike = (id) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, liked: !m.liked } : m));
  };

  const clearChat = () => {
    if (window.confirm("Da li si sigurna da želiš da obrišeš istoriju čata?")) {
      setMessages([{
        id: 'init-1',
        sender: 'bot',
        text: 'OMG! ✨ Otkud ti? Zar ne misliš da to ima previše kalorija',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] text-[#2C2A29] flex flex-col items-center justify-between font-sans antialiased">
      
      {/* GLAVNI KONTEJNER CHAT-A */}
      <div className="w-full max-w-lg min-h-screen flex flex-col bg-[#FAF6EE] border-x border-[#EADFC9] shadow-md relative overflow-hidden">
        
        {/* HEADER */}
        <header className="sticky top-0 z-20 bg-[#FAF6EE]/90 backdrop-blur-md border-b border-[#EADFC9] px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="w-8"></div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full border-2 border-[#8B5A2B] overflow-hidden shadow-sm flex-shrink-0">
                <img 
                  src={TASHA_AVATAR_URL} 
                  alt="Taša" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="font-serif font-bold text-base text-[#3D312A]">
                Tina ❄️
              </h1>
            </div>
            <p className="text-[11px] text-[#8C7A6B] italic">Healthy Girl Bestie</p>
          </div>

          <button 
            onClick={clearChat}
            className="p-2 rounded-full hover:bg-[#EADFC9]/50 text-[#8C7A6B] transition"
            title="Obriši poruke"
          >
            <Trash2 size={18} />
          </button>
        </header>

        {/* CHAT MESSAGES AREA S POZADINSKIM KOLAŽEM */}
        <main 
          className="flex-1 p-4 space-y-3 overflow-y-auto pb-32 text-left relative bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(253, 251, 247, 0.2), rgba(250, 246, 238, 0.2)), url(${BACKGROUND_COLLAGE_URL})`
          }}
        >
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-end space-x-2 max-w-[88%]">
                {msg.sender === 'bot' && (
                  <div className="w-10 h-10 rounded-full border border-[#8B5A2B] overflow-hidden flex-shrink-0 mb-1 shadow-sm">
                    <img 
                      src={TASHA_AVATAR_URL} 
                      alt="Taša" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div 
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm relative ${
                    msg.sender === 'user' 
                      ? 'bg-[#8B5A2B]/95 text-white rounded-br-none text-left' 
                      : 'bg-white/90 text-[#2C2A29] border border-[#EADFC9] rounded-bl-none text-left backdrop-blur-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  
                  <div className={`flex items-center justify-between mt-1.5 text-[9px] ${
                    msg.sender === 'user' ? 'text-white/70' : 'text-[#A09080]'
                  }`}>
                    <span>{msg.time}</span>
                    {msg.sender === 'bot' && (
                      <button 
                        onClick={() => toggleLike(msg.id)} 
                        className="ml-2 hover:scale-110 transition text-[#D4A373]"
                      >
                        <Heart size={12} fill={msg.liked ? "#D4A373" : "none"} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-[#8C7A6B] text-xs italic pl-8 animate-pulse bg-white/70 p-2 rounded-full w-max backdrop-blur-xs border border-[#EADFC9]">
              <Sparkles size={14} className="text-[#D4A373]" />
              <span>Tina kucka poruku uz proteinski puding ... </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* INPUT & CHIPS AREA */}
        <footer className="absolute bottom-0 left-0 right-0 bg-[#FAF6EE]/95 backdrop-blur-md border-t border-[#EADFC9] p-3 space-y-2">
         

          {/* Input form */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Napiši poruku Tini..."
              className="flex-1 bg-white/90 border border-[#EADFC9] rounded-full px-4 py-2 text-xs sm:text-sm text-[#2C2A29] placeholder-[#A8988A] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 transition"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-[#8B5A2B] hover:bg-[#724822] text-white rounded-full disabled:opacity-40 transition flex-shrink-0 shadow-sm"
            >
              <Send size={16} />
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}