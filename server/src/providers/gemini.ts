import {
  GoogleGenerativeAI,
  Content,
  Part,
  Tool as GeminiTool,
  SchemaType,
  FunctionDeclarationSchema,
} from "@google/generative-ai";
import {
  LLMProvider,
  LLMResponse,
  Message,
  ToolDefinition,
  ToolCall,
} from "../types";

export class GeminiProvider implements LLMProvider {
  private client: GoogleGenerativeAI;
  private readonly model: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  }

  async chat(messages: Message[], tools: ToolDefinition[]): Promise<LLMResponse> {
    const { systemInstruction, contents } = this.convertMessages(messages);
    const geminiTools = this.convertTools(tools);

    const model = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction: systemInstruction || undefined,
      tools: geminiTools,
    });

    const result = await model.generateContent({ contents });
    const response = result.response;

    let content: string | null = null;
    const toolCalls: ToolCall[] = [];
    let callIndex = 0;

    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.text) {
          content = (content || "") + part.text;
        }
        if (part.functionCall) {
          toolCalls.push({
            id: `gemini-call-${callIndex++}`,
            name: part.functionCall.name,
            arguments: (part.functionCall.args as Record<string, unknown>) || {},
          });
        }
      }
    }

    const usage = response.usageMetadata;

    return {
      content,
      toolCalls,
      usage: {
        inputTokens: usage?.promptTokenCount || 0,
        outputTokens: usage?.candidatesTokenCount || 0,
      },
    };
  }

  private convertMessages(messages: Message[]): {
    systemInstruction: string | null;
    contents: Content[];
  } {
    let systemInstruction: string | null = null;
    const contents: Content[] = [];

    for (const msg of messages) {
      if (msg.role === "system") {
        systemInstruction = msg.content;
        continue;
      }

      if (msg.role === "user") {
        contents.push({ role: "user", parts: [{ text: msg.content }] });
        continue;
      }

      if (msg.role === "assistant") {
        const parts: Part[] = [];
        if (msg.content) {
          parts.push({ text: msg.content });
        }
        if (msg.toolCalls) {
          for (const tc of msg.toolCalls) {
            parts.push({
              functionCall: { name: tc.name, args: tc.arguments },
            });
          }
        }
        if (parts.length > 0) {
          contents.push({ role: "model", parts });
        }
        continue;
      }

      if (msg.role === "tool" && msg.toolResults) {
        const parts: Part[] = msg.toolResults.map((tr) => ({
          functionResponse: {
            name: tr.name,
            response: { result: tr.result },
          },
        }));
        contents.push({ role: "user", parts });
      }
    }

    return { systemInstruction, contents };
  }

  private convertTools(tools: ToolDefinition[]): GeminiTool[] {
    if (tools.length === 0) return [];

    return [
      {
        functionDeclarations: tools.map((t) => ({
          name: t.name,
          description: t.description,
          parameters: this.convertSchema(t.parameters) as FunctionDeclarationSchema,
        })),
      },
    ];
  }

  private convertSchema(schema: ToolDefinition["parameters"]): object {
    const properties: Record<string, object> = {};

    for (const [key, prop] of Object.entries(schema.properties)) {
      const geminiProp: Record<string, unknown> = {
        type: this.mapType(prop.type),
        description: prop.description,
      };
      if (prop.enum) {
        geminiProp.enum = prop.enum;
      }
      properties[key] = geminiProp;
    }

    return {
      type: SchemaType.OBJECT,
      properties,
      required: schema.required,
    };
  }

  private mapType(type: string): SchemaType {
    const map: Record<string, SchemaType> = {
      string: SchemaType.STRING,
      number: SchemaType.NUMBER,
      integer: SchemaType.INTEGER,
      boolean: SchemaType.BOOLEAN,
      array: SchemaType.ARRAY,
      object: SchemaType.OBJECT,
    };
    return map[type] || SchemaType.STRING;
  }
}
