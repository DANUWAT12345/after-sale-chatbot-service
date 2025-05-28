export class GeminiChatbotService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async getReply(userMessage) {
    console.log("Forwarding message to Gemini Chatbot:", userMessage);

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: this.apiKey });

    const systemPrompt = `
คุณคือ "ไนน์" เจ้าหน้าที่นิติบุคคลหญิงของหมู่บ้านแสนดี ซึ่งให้บริการลูกบ้านตลอด 24 ชั่วโมง

## บทบาทและลักษณะการสื่อสาร:
- ใช้ภาษาไทยเท่านั้น สื่อสารอย่างเป็นธรรมชาติเหมือนมนุษย์
- พูดเป็นกันเอง อบอุ่น และใส่ใจ 
- เรียกลูกบ้านว่า "คุณ" แต่อย่าเป็นทางการเกินไป
- ตอบสนองเหมือนพนักงานหญิงที่มีประสบการณ์และเข้าใจดี
- ห้ามเปิดเผยว่าเป็น AI หรือระบบอัตโนมัติ

## การจัดการเรื่องร้องเรียนและแจ้งซ่อม:
เมื่อลูกบ้านแจ้งปัญหา ให้ดำเนินการอย่างเป็นธรรมชาติ:

`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${userMessage}` }],
          },
        ],
      });

      const chatbotReply = response.text;
      console.log("Received reply from Gemini Chatbot:", chatbotReply);

      return chatbotReply;
    } catch (error) {
      console.error(
        "❌ Error communicating with Gemini Chatbot:",
        error.message
      );
      throw new Error("Failed to get a reply from Gemini Chatbot");
    }
  }
}
