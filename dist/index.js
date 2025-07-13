var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  audioCache: () => audioCache,
  books: () => books,
  booksRelations: () => booksRelations,
  chapters: () => chapters,
  chaptersRelations: () => chaptersRelations,
  conversations: () => conversations,
  conversationsRelations: () => conversationsRelations,
  insertAudioCacheSchema: () => insertAudioCacheSchema,
  insertBookSchema: () => insertBookSchema,
  insertChapterSchema: () => insertChapterSchema,
  insertConversationSchema: () => insertConversationSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertTranslationSchema: () => insertTranslationSchema,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  selectAudioCacheSchema: () => selectAudioCacheSchema,
  selectBookSchema: () => selectBookSchema,
  selectChapterSchema: () => selectChapterSchema,
  selectConversationSchema: () => selectConversationSchema,
  selectMessageSchema: () => selectMessageSchema,
  selectTranslationSchema: () => selectTranslationSchema,
  translations: () => translations
});
import { pgTable, text, serial, timestamp, jsonb, integer, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var books, chapters, translations, conversations, messages, audioCache, booksRelations, chaptersRelations, conversationsRelations, messagesRelations, insertBookSchema, selectBookSchema, insertChapterSchema, selectChapterSchema, insertTranslationSchema, selectTranslationSchema, insertConversationSchema, selectConversationSchema, insertMessageSchema, selectMessageSchema, insertAudioCacheSchema, selectAudioCacheSchema;
var init_schema = __esm({
  "server/src/db/schema.ts"() {
    "use strict";
    books = pgTable("books", {
      id: serial("id").primaryKey(),
      sefariaRef: text("sefaria_ref").notNull().unique(),
      titleHe: text("title_he").notNull(),
      titleEn: text("title_en").notNull(),
      titleFr: text("title_fr"),
      author: text("author").default("Nachman of Breslov"),
      category: text("category").default("Chasidut"),
      content: jsonb("content").notNull(),
      // Full book content structure
      metadata: jsonb("metadata"),
      // Additional metadata from Sefaria
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    }, (table) => {
      return {
        sefariaRefIdx: index("idx_sefaria_ref").on(table.sefariaRef),
        categoryIdx: index("idx_category").on(table.category)
      };
    });
    chapters = pgTable("chapters", {
      id: serial("id").primaryKey(),
      bookId: integer("book_id").references(() => books.id).notNull(),
      chapterNumber: integer("chapter_number").notNull(),
      sefariaRef: text("sefaria_ref").notNull(),
      titleHe: text("title_he"),
      titleEn: text("title_en"),
      titleFr: text("title_fr"),
      contentHe: text("content_he").notNull(),
      contentEn: text("content_en").notNull(),
      contentFr: text("content_fr"),
      // Cached French translation
      metadata: jsonb("metadata"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    }, (table) => {
      return {
        bookChapterIdx: index("idx_book_chapter").on(table.bookId, table.chapterNumber),
        sefariaRefIdx: index("idx_chapter_sefaria_ref").on(table.sefariaRef)
      };
    });
    translations = pgTable("translations", {
      id: serial("id").primaryKey(),
      sourceText: text("source_text").notNull(),
      sourceLanguage: text("source_language").notNull(),
      targetLanguage: text("target_language").notNull(),
      translatedText: text("translated_text").notNull(),
      chunkIndex: integer("chunk_index").default(0),
      totalChunks: integer("total_chunks").default(1),
      reference: text("reference"),
      // Optional Sefaria reference
      createdAt: timestamp("created_at").defaultNow().notNull()
    }, (table) => {
      return {
        sourceTextIdx: index("idx_source_text").on(table.sourceText),
        referenceIdx: index("idx_reference").on(table.reference)
      };
    });
    conversations = pgTable("conversations", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      mode: text("mode").notNull(),
      // 'chapter', 'book', 'global'
      contextReference: text("context_reference"),
      // Current context (book/chapter)
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    messages = pgTable("messages", {
      id: serial("id").primaryKey(),
      conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
      role: text("role").notNull(),
      // 'user' or 'assistant'
      content: text("content").notNull(),
      references: jsonb("references"),
      // Array of text references used
      metadata: jsonb("metadata"),
      // Additional data
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    audioCache = pgTable("audio_cache", {
      id: serial("id").primaryKey(),
      textHash: text("text_hash").notNull().unique(),
      text: text("text").notNull(),
      language: text("language").notNull(),
      voiceId: text("voice_id").notNull(),
      audioUrl: text("audio_url").notNull(),
      duration: integer("duration"),
      // Duration in seconds
      metadata: jsonb("metadata"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      lastAccessedAt: timestamp("last_accessed_at").defaultNow().notNull()
    }, (table) => {
      return {
        textHashIdx: index("idx_text_hash").on(table.textHash),
        languageIdx: index("idx_language").on(table.language)
      };
    });
    booksRelations = relations(books, ({ many }) => ({
      chapters: many(chapters)
    }));
    chaptersRelations = relations(chapters, ({ one }) => ({
      book: one(books, {
        fields: [chapters.bookId],
        references: [books.id]
      })
    }));
    conversationsRelations = relations(conversations, ({ many }) => ({
      messages: many(messages)
    }));
    messagesRelations = relations(messages, ({ one }) => ({
      conversation: one(conversations, {
        fields: [messages.conversationId],
        references: [conversations.id]
      })
    }));
    insertBookSchema = createInsertSchema(books);
    selectBookSchema = createSelectSchema(books);
    insertChapterSchema = createInsertSchema(chapters);
    selectChapterSchema = createSelectSchema(chapters);
    insertTranslationSchema = createInsertSchema(translations);
    selectTranslationSchema = createSelectSchema(translations);
    insertConversationSchema = createInsertSchema(conversations);
    selectConversationSchema = createSelectSchema(conversations);
    insertMessageSchema = createInsertSchema(messages);
    selectMessageSchema = createSelectSchema(messages);
    insertAudioCacheSchema = createInsertSchema(audioCache);
    selectAudioCacheSchema = createSelectSchema(audioCache);
  }
});

// server/src/db/index.ts
var db_exports = {};
__export(db_exports, {
  audioCache: () => audioCache,
  books: () => books,
  booksRelations: () => booksRelations,
  chapters: () => chapters,
  chaptersRelations: () => chaptersRelations,
  conversations: () => conversations,
  conversationsRelations: () => conversationsRelations,
  db: () => db,
  insertAudioCacheSchema: () => insertAudioCacheSchema,
  insertBookSchema: () => insertBookSchema,
  insertChapterSchema: () => insertChapterSchema,
  insertConversationSchema: () => insertConversationSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertTranslationSchema: () => insertTranslationSchema,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  selectAudioCacheSchema: () => selectAudioCacheSchema,
  selectBookSchema: () => selectBookSchema,
  selectChapterSchema: () => selectChapterSchema,
  selectConversationSchema: () => selectConversationSchema,
  selectMessageSchema: () => selectMessageSchema,
  selectTranslationSchema: () => selectTranslationSchema,
  testConnection: () => testConnection,
  translations: () => translations
});
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log("\u2705 Database connected successfully:", result[0].now);
    return true;
  } catch (error) {
    console.error("\u274C Database connection failed:", error);
    return false;
  }
}
var DATABASE_URL, sql, db;
var init_db = __esm({
  "server/src/db/index.ts"() {
    "use strict";
    init_schema();
    init_schema();
    dotenv.config();
    DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      console.error("Available env vars:", Object.keys(process.env).filter((k) => k.includes("DATABASE")));
      throw new Error("DATABASE_URL is not defined in environment variables");
    }
    sql = neon(DATABASE_URL);
    db = drizzle(sql, { schema: schema_exports });
  }
});

// server/src/index.ts
import express from "express";
import cors from "cors";
import dotenv2 from "dotenv";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

// server/src/routes/sefaria.ts
import { Router } from "express";
import { z } from "zod";

// server/src/middleware/errorHandler.ts
var AppError = class extends Error {
  statusCode;
  isOperational;
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
};
var ERROR_MESSAGES = {
  SEFARIA_DOWN: "Impossible de r\xE9cup\xE9rer les textes. R\xE9essayez plus tard.",
  GEMINI_LIMIT: "Limite de traduction atteinte. Patientez quelques secondes.",
  TTS_FAILED: "Synth\xE8se vocale indisponible. V\xE9rifiez votre connexion.",
  DATABASE_ERROR: "Erreur de base de donn\xE9es. Veuillez r\xE9essayer.",
  VALIDATION_ERROR: "Donn\xE9es invalides. V\xE9rifiez votre requ\xEAte.",
  NOT_FOUND: "Ressource non trouv\xE9e.",
  UNAUTHORIZED: "Acc\xE8s non autoris\xE9.",
  SERVER_ERROR: "Erreur serveur. Nous travaillons \xE0 r\xE9soudre le probl\xE8me."
};
var asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
var errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = ERROR_MESSAGES.SERVER_ERROR;
  let details = void 0;
  if (req.path === "/" || req.path === "/api/health") {
    console.error("Health check error:", err.message);
    return res.status(200).json({
      status: "degraded",
      error: "Health check encountered error but server is running",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = ERROR_MESSAGES.VALIDATION_ERROR;
    details = err.message;
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = ERROR_MESSAGES.NOT_FOUND;
  } else if (err.name === "SyntaxError") {
    statusCode = 400;
    message = ERROR_MESSAGES.VALIDATION_ERROR;
    details = "Invalid JSON format";
  }
  console.error("Application Error:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : "Hidden in production",
    statusCode,
    path: req.path,
    method: req.method,
    userAgent: req.get("User-Agent"),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (res.headersSent) {
    return next(err);
  }
  res.status(statusCode).json({
    success: false,
    message,
    ...details && { details },
    ...process.env.NODE_ENV === "development" && {
      stack: err.stack,
      originalError: err.message
    }
  });
};

// server/src/services/SefariaService.ts
import fetch from "node-fetch";
init_db();
import { eq } from "drizzle-orm";
var SEFARIA_BASE_URL = "https://www.sefaria.org/api";
var SefariaService = class _SefariaService {
  static instance;
  constructor() {
  }
  static getInstance() {
    if (!_SefariaService.instance) {
      _SefariaService.instance = new _SefariaService();
    }
    return _SefariaService.instance;
  }
  /**
   * Get all Breslev books from Sefaria index
   */
  async getBreslevBooks() {
    try {
      const response = await fetch(`${SEFARIA_BASE_URL}/index`);
      if (!response.ok) {
        throw new AppError("Failed to fetch Sefaria index", response.status);
      }
      const allBooks = await response.json();
      return allBooks.filter(
        (book) => book.categories.includes("Chasidut") && (book.authors?.includes("Nachman of Breslov") || book.title.includes("Likutei Moharan") || book.title.includes("Chayei Moharan") || book.title.includes("Sichot HaRan") || book.title.includes("Sefer HaMiddot") || book.title.includes("Kitzur Likutei Moharan"))
      );
    } catch (error) {
      console.error("Error fetching Breslev books:", error);
      throw new AppError("Impossible de r\xE9cup\xE9rer les livres de Rabbi Nahman", 500);
    }
  }
  /**
   * Get text with context from Sefaria
   */
  async getText(ref) {
    try {
      const cachedChapter = await db.query.chapters.findFirst({
        where: eq(chapters.sefariaRef, ref)
      });
      if (cachedChapter) {
        return {
          ref: cachedChapter.sefariaRef,
          heRef: cachedChapter.sefariaRef,
          text: cachedChapter.contentEn,
          he: cachedChapter.contentHe,
          versions: [],
          book: ref.split(" ")[0],
          sections: this.parseSections(ref)
        };
      }
      const params = new URLSearchParams({
        commentary: "0",
        context: "1",
        pad: "0",
        wrapLinks: "0"
      });
      const response = await fetch(`${SEFARIA_BASE_URL}/texts/${encodeURIComponent(ref)}?${params}`);
      if (!response.ok) {
        throw new AppError(`Failed to fetch text: ${ref}`, response.status);
      }
      const data = await response.json();
      await this.cacheChapter(data);
      return data;
    } catch (error) {
      console.error("Error fetching text:", error);
      throw new AppError("Impossible de r\xE9cup\xE9rer le texte demand\xE9", 500);
    }
  }
  /**
   * Search texts in Sefaria
   */
  async searchTexts(query, filters) {
    try {
      const params = new URLSearchParams({
        q: query,
        size: "20",
        filters: filters?.book ? `path:${filters.book}` : ""
      });
      const response = await fetch(`${SEFARIA_BASE_URL}/search-wrapper?${params}`);
      if (!response.ok) {
        throw new AppError("Search failed", response.status);
      }
      return await response.json();
    } catch (error) {
      console.error("Error searching texts:", error);
      throw new AppError("Recherche impossible", 500);
    }
  }
  /**
   * Get table of contents for a book
   */
  async getBookContents(bookTitle) {
    try {
      const response = await fetch(`${SEFARIA_BASE_URL}/index/${encodeURIComponent(bookTitle)}`);
      if (!response.ok) {
        throw new AppError(`Book not found: ${bookTitle}`, response.status);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching book contents:", error);
      throw new AppError("Impossible de r\xE9cup\xE9rer le contenu du livre", 500);
    }
  }
  /**
   * Cache chapter data in database
   */
  async cacheChapter(data) {
    try {
      const bookTitle = data.book;
      const chapterNumber = data.sections[0] || 1;
      let book = await db.query.books.findFirst({
        where: eq(books.sefariaRef, bookTitle)
      });
      if (!book) {
        const [newBook] = await db.insert(books).values({
          sefariaRef: bookTitle,
          titleHe: data.heRef.split(" ")[0],
          titleEn: bookTitle,
          content: { chapters: [] }
        }).returning();
        book = newBook;
      }
      await db.insert(chapters).values({
        bookId: book.id,
        chapterNumber,
        sefariaRef: data.ref,
        contentHe: Array.isArray(data.he) ? data.he.join(" ") : data.he,
        contentEn: Array.isArray(data.text) ? data.text.join(" ") : data.text,
        metadata: {
          versions: data.versions,
          next: data.next,
          prev: data.prev
        }
      }).onConflictDoNothing();
    } catch (error) {
      console.error("Error caching chapter:", error);
    }
  }
  /**
   * Parse section numbers from reference
   */
  parseSections(ref) {
    const parts = ref.split(" ");
    const sections = [];
    for (let i = 1; i < parts.length; i++) {
      const num = parseInt(parts[i]);
      if (!isNaN(num)) {
        sections.push(num);
      }
    }
    return sections;
  }
};

// server/src/routes/sefaria.ts
var router = Router();
var sefariaService = SefariaService.getInstance();
var getTextSchema = z.object({
  ref: z.string().min(1, "Reference is required")
});
var searchSchema = z.object({
  q: z.string().min(1, "Search query is required"),
  book: z.string().optional(),
  exact: z.boolean().optional()
});
router.get("/books", asyncHandler(async (req, res) => {
  const books2 = await sefariaService.getBreslevBooks();
  res.json({
    success: true,
    data: books2,
    count: books2.length
  });
}));
router.get("/text/:ref", asyncHandler(async (req, res) => {
  const { ref } = getTextSchema.parse({ ref: req.params.ref });
  const text2 = await sefariaService.getText(ref);
  res.json({
    success: true,
    data: text2
  });
}));
router.post("/search", asyncHandler(async (req, res) => {
  const { q, book, exact } = searchSchema.parse(req.body);
  const results = await sefariaService.searchTexts(q, { book, exact });
  res.json({
    success: true,
    data: results
  });
}));
router.get("/contents/:book", asyncHandler(async (req, res) => {
  const book = req.params.book;
  const contents = await sefariaService.getBookContents(book);
  res.json({
    success: true,
    data: contents
  });
}));
var sefaria_default = router;

// server/src/routes/gemini.ts
import { Router as Router2 } from "express";
import { z as z2 } from "zod";

// server/src/services/GeminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
init_db();
import { eq as eq2, and } from "drizzle-orm";
import crypto from "crypto";
var GEMINI_API_KEY = process.env.GEMINI_API_KEY;
var CHUNK_SIZE = 1e3;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables");
}
var GeminiService = class _GeminiService {
  static instance;
  genAI;
  model;
  constructor() {
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }
  static getInstance() {
    if (!_GeminiService.instance) {
      _GeminiService.instance = new _GeminiService();
    }
    return _GeminiService.instance;
  }
  /**
   * Translate text with chunking support
   */
  async translateText({ text: text2, sourceLanguage, targetLanguage, reference }) {
    try {
      const cached = await db.query.translations.findFirst({
        where: and(
          eq2(translations.sourceText, text2),
          eq2(translations.sourceLanguage, sourceLanguage),
          eq2(translations.targetLanguage, targetLanguage)
        )
      });
      if (cached) {
        return {
          translatedText: cached.translatedText,
          fromCache: true
        };
      }
      const chunks = this.splitIntoChunks(text2, CHUNK_SIZE);
      const translatedChunks = [];
      for (let i = 0; i < chunks.length; i++) {
        const prompt = `Traduisez le texte suivant du ${sourceLanguage} vers le ${targetLanguage}. 
        Gardez le style et le ton du texte original. 
        Ne traduisez que le texte fourni, sans ajouter d'explications.
        
        Texte \xE0 traduire:
        ${chunks[i]}`;
        const result = await this.model.generateContent(prompt);
        const translatedChunk = result.response.text();
        translatedChunks.push(translatedChunk);
        await db.insert(translations).values({
          sourceText: chunks[i],
          sourceLanguage,
          targetLanguage,
          translatedText: translatedChunk,
          chunkIndex: i,
          totalChunks: chunks.length,
          reference
        });
        if (i < chunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1e3));
        }
      }
      const fullTranslation = translatedChunks.join(" ");
      return {
        translatedText: fullTranslation,
        fromCache: false,
        chunks: chunks.length
      };
    } catch (error) {
      console.error("Translation error:", error);
      throw new AppError("Erreur de traduction. Veuillez r\xE9essayer.", 500);
    }
  }
  /**
   * Handle AI chat with context
   */
  async chat({ message, mode, context, conversationId }) {
    try {
      let conversation;
      if (conversationId) {
        conversation = await db.query.conversations.findFirst({
          where: eq2(conversations.id, conversationId)
        });
      }
      if (!conversation) {
        const [newConv] = await db.insert(conversations).values({
          title: message.substring(0, 50) + "...",
          mode,
          contextReference: context
        }).returning();
        conversation = newConv;
      }
      const history = await db.query.messages.findMany({
        where: eq2(messages.conversationId, conversation.id),
        orderBy: (messages2, { asc }) => [asc(messages2.createdAt)],
        limit: 10
      });
      const systemPrompt = this.buildSystemPrompt(mode, context);
      const chatHistory = history.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }));
      if (chatHistory.length === 0) {
        chatHistory.push({
          role: "user",
          parts: [{ text: systemPrompt }]
        }, {
          role: "model",
          parts: [{ text: "Je comprends. Je baserai toutes mes r\xE9ponses sur les textes de Rabbi Nahman et citerai les r\xE9f\xE9rences exactes." }]
        });
      }
      const chat = this.model.startChat({
        history: chatHistory,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048
        }
      });
      const result = await chat.sendMessage(message);
      const response = result.response.text();
      await db.insert(messages).values([
        {
          conversationId: conversation.id,
          role: "user",
          content: message,
          metadata: { mode, context }
        },
        {
          conversationId: conversation.id,
          role: "assistant",
          content: response,
          references: this.extractReferences(response)
        }
      ]);
      return {
        response,
        conversationId: conversation.id,
        mode,
        context
      };
    } catch (error) {
      console.error("Chat error:", error);
      throw new AppError("Erreur de conversation. Veuillez r\xE9essayer.", 500);
    }
  }
  /**
   * Build system prompt based on chat mode
   */
  buildSystemPrompt(mode, context) {
    const basePrompt = `Tu es un expert des enseignements de Rabbi Nahman de Breslev.
    R\xC8GLES CRITIQUES :
    1. Base TOUTES tes r\xE9ponses sur les textes fournis
    2. Cite TOUJOURS les r\xE9f\xE9rences exactes (Livre, Chapitre, Verset)
    3. Ne JAMAIS inventer ou g\xE9n\xE9raliser
    4. Si tu ne trouves pas dans les textes, dis-le clairement
    5. Analyse en profondeur le contexte spirituel des enseignements
    6. Utilise un langage respectueux et pr\xE9cis`;
    switch (mode) {
      case "chapter":
        return `${basePrompt}

Contexte actuel : Chapitre ${context || "non sp\xE9cifi\xE9"}. 
        Concentre-toi uniquement sur ce chapitre pour r\xE9pondre.`;
      case "book":
        return `${basePrompt}

Contexte actuel : Livre ${context || "non sp\xE9cifi\xE9"}. 
        Tu peux utiliser tous les chapitres de ce livre pour r\xE9pondre.`;
      case "global":
        return `${basePrompt}

Mode global : Tu peux chercher dans tous les livres de Rabbi Nahman. 
        Pr\xE9cise toujours de quel livre provient chaque citation.`;
      default:
        return basePrompt;
    }
  }
  /**
   * Extract references from AI response
   */
  extractReferences(text2) {
    const references = [];
    const refPattern = /(?:Likutei Moharan|Chayei Moharan|Sichot HaRan|Sefer HaMiddot)\s*(?:I{1,2})?\s*:?\s*\d+/gi;
    const matches = text2.match(refPattern);
    if (matches) {
      references.push(...matches.map((ref) => ({
        text: ref,
        type: "direct"
      })));
    }
    return references;
  }
  /**
   * Split text into chunks
   */
  splitIntoChunks(text2, maxSize) {
    if (text2.length <= maxSize) {
      return [text2];
    }
    const chunks = [];
    const sentences = text2.split(/[.!?]+/);
    let currentChunk = "";
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ". " : "") + sentence;
      }
    }
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    return chunks;
  }
  /**
   * Hash text for caching
   */
  hashText(text2) {
    return crypto.createHash("sha256").update(text2).digest("hex");
  }
};

// server/src/routes/gemini.ts
var router2 = Router2();
var geminiService = GeminiService.getInstance();
var translateSchema = z2.object({
  text: z2.string().min(1, "Text is required"),
  sourceLanguage: z2.string().min(1, "Source language is required"),
  targetLanguage: z2.string().min(1, "Target language is required"),
  reference: z2.string().optional()
});
var chatSchema = z2.object({
  message: z2.string().min(1, "Message is required"),
  mode: z2.enum(["chapter", "book", "global"]),
  context: z2.string().optional(),
  conversationId: z2.number().optional()
});
router2.post("/translate", asyncHandler(async (req, res) => {
  const { text: text2, sourceLanguage, targetLanguage, reference } = translateSchema.parse(req.body);
  const result = await geminiService.translateText({
    text: text2,
    sourceLanguage,
    targetLanguage,
    reference
  });
  res.json({
    success: true,
    data: result
  });
}));
router2.post("/chat", asyncHandler(async (req, res) => {
  const { message, mode, context, conversationId } = chatSchema.parse(req.body);
  const result = await geminiService.chat({
    message,
    mode,
    context,
    conversationId
  });
  res.json({
    success: true,
    data: result
  });
}));
router2.get("/conversations", asyncHandler(async (req, res) => {
  const { db: db2, conversations: conversations2 } = await Promise.resolve().then(() => (init_db(), db_exports));
  const allConversations = await db2.query.conversations.findMany({
    where: (conversations3, { eq: eq4 }) => eq4(conversations3.isActive, true),
    orderBy: (conversations3, { desc }) => [desc(conversations3.updatedAt)],
    limit: 50
  });
  res.json({
    success: true,
    data: allConversations
  });
}));
router2.get("/conversations/:id", asyncHandler(async (req, res) => {
  const conversationId = parseInt(req.params.id);
  if (isNaN(conversationId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid conversation ID"
    });
  }
  const { db: db2, conversations: conversations2, messages: messages2 } = await Promise.resolve().then(() => (init_db(), db_exports));
  const { eq: eq4 } = await import("drizzle-orm");
  const conversation = await db2.query.conversations.findFirst({
    where: eq4(conversations2.id, conversationId),
    with: {
      messages: {
        orderBy: (messages3, { asc }) => [asc(messages3.createdAt)]
      }
    }
  });
  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: "Conversation not found"
    });
  }
  res.json({
    success: true,
    data: conversation
  });
}));
router2.delete("/conversations/:id", asyncHandler(async (req, res) => {
  const conversationId = parseInt(req.params.id);
  if (isNaN(conversationId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid conversation ID"
    });
  }
  const { db: db2, conversations: conversations2 } = await Promise.resolve().then(() => (init_db(), db_exports));
  const { eq: eq4 } = await import("drizzle-orm");
  await db2.update(conversations2).set({ isActive: false }).where(eq4(conversations2.id, conversationId));
  res.json({
    success: true,
    message: "Conversation deleted"
  });
}));
var gemini_default = router2;

// server/src/routes/books.ts
import { Router as Router3 } from "express";
import { z as z3 } from "zod";
init_db();
import { eq as eq3, and as and2, or, ilike, count } from "drizzle-orm";
var router3 = Router3();
var getBookSchema = z3.object({
  id: z3.string().regex(/^\d+$/, "Invalid book ID").transform(Number)
});
var searchBooksSchema = z3.object({
  q: z3.string().optional(),
  category: z3.string().optional(),
  limit: z3.string().regex(/^\d+$/).transform(Number).optional()
});
router3.get("/", asyncHandler(async (req, res) => {
  const { q, category, limit } = searchBooksSchema.parse(req.query);
  let query = db.query.books.findMany({
    with: {
      chapters: {
        limit: 1
        // Just get first chapter for preview
      }
    },
    orderBy: (books2, { asc }) => [asc(books2.titleEn)],
    ...limit && { limit }
  });
  if (q || category) {
    const conditions = [];
    if (q) {
      conditions.push(
        or(
          ilike(books.titleEn, `%${q}%`),
          ilike(books.titleFr, `%${q}%`),
          ilike(books.titleHe, `%${q}%`)
        )
      );
    }
    if (category) {
      conditions.push(eq3(books.category, category));
    }
    if (conditions.length > 0) {
      query = db.query.books.findMany({
        where: and2(...conditions),
        with: {
          chapters: {
            limit: 1
          }
        },
        orderBy: (books2, { asc }) => [asc(books2.titleEn)],
        ...limit && { limit }
      });
    }
  }
  const allBooks = await query;
  res.json({
    success: true,
    data: allBooks,
    count: allBooks.length
  });
}));
router3.get("/:id", asyncHandler(async (req, res) => {
  const { id } = getBookSchema.parse(req.params);
  const book = await db.query.books.findFirst({
    where: eq3(books.id, id),
    with: {
      chapters: {
        orderBy: (chapters2, { asc }) => [asc(chapters2.chapterNumber)]
      }
    }
  });
  if (!book) {
    return res.status(404).json({
      success: false,
      message: "Book not found"
    });
  }
  res.json({
    success: true,
    data: book
  });
}));
router3.get("/:id/chapters", asyncHandler(async (req, res) => {
  const { id } = getBookSchema.parse(req.params);
  const bookChapters = await db.query.chapters.findMany({
    where: eq3(chapters.bookId, id),
    orderBy: (chapters2, { asc }) => [asc(chapters2.chapterNumber)]
  });
  res.json({
    success: true,
    data: bookChapters,
    count: bookChapters.length
  });
}));
router3.get("/:id/chapters/:chapterNumber", asyncHandler(async (req, res) => {
  const { id } = getBookSchema.parse(req.params);
  const chapterNumber = parseInt(req.params.chapterNumber);
  if (isNaN(chapterNumber)) {
    return res.status(400).json({
      success: false,
      message: "Invalid chapter number"
    });
  }
  const chapter = await db.query.chapters.findFirst({
    where: and2(
      eq3(chapters.bookId, id),
      eq3(chapters.chapterNumber, chapterNumber)
    ),
    with: {
      book: true
    }
  });
  if (!chapter) {
    return res.status(404).json({
      success: false,
      message: "Chapter not found"
    });
  }
  res.json({
    success: true,
    data: chapter
  });
}));
router3.get("/stats", asyncHandler(async (req, res) => {
  const [bookCount] = await db.select({ count: count() }).from(books);
  const [chapterCount] = await db.select({ count: count() }).from(chapters);
  const booksByCategory = await db.select({
    category: books.category,
    count: count()
  }).from(books).groupBy(books.category);
  res.json({
    success: true,
    data: {
      totalBooks: bookCount.count,
      totalChapters: chapterCount.count,
      booksByCategory: booksByCategory.reduce((acc, item) => {
        acc[item.category || "Unknown"] = item.count;
        return acc;
      }, {})
    }
  });
}));
var books_default = router3;

// server/src/middleware/cors.ts
var corsConfig = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://breslev-torah-online.replit.app",
      "https://replit.com"
    ];
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV === "development") {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["X-Total-Count", "X-Page-Count"],
  maxAge: 86400
  // 24 hours
};

// server/src/index.ts
dotenv2.config({ path: path.resolve(process.cwd(), ".env") });
if (process.env.NODE_ENV === "production") {
  console.log("\u{1F680} Production mode detected");
  console.log("\u{1F527} Checking deployment configuration...");
  const requiredEnvVars = {
    "PORT": process.env.PORT,
    "DATABASE_URL": process.env.DATABASE_URL,
    "GEMINI_API_KEY": process.env.GEMINI_API_KEY
  };
  let missingVars = [];
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missingVars.push(key);
    } else {
      console.log(`\u2705 ${key}: configured`);
    }
  }
  if (missingVars.length > 0) {
    console.log(`\u26A0\uFE0F  Missing environment variables: ${missingVars.join(", ")}`);
    console.log("\u{1F527} Server will start but some features may not work");
  } else {
    console.log("\u2705 All critical environment variables configured");
  }
}
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var server = createServer(app);
var PORT = process.env.PORT || 5e3;
app.use(cors(corsConfig));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
var healthResponse = {
  status: "ok",
  app: "Le Compagnon du C\u0153ur",
  timestamp: (/* @__PURE__ */ new Date()).toISOString(),
  environment: process.env.NODE_ENV || "development",
  port: PORT
};
app.get("/", (req, res, next) => {
  const timeoutId = setTimeout(() => {
    if (!res.headersSent) {
      res.status(200).json({
        status: "ok",
        app: "Le Compagnon du C\u0153ur",
        message: "Health check timeout but server responsive",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        port: PORT
      });
    }
  }, 4e3);
  try {
    const userAgent = req.get("User-Agent") || "";
    const isHealthCheck = userAgent.includes("curl") || userAgent.includes("wget") || userAgent.includes("health") || userAgent.includes("Go-http-client") || userAgent.includes("Replit") || req.headers.accept === "application/json";
    if (isHealthCheck || req.query.health === "true") {
      clearTimeout(timeoutId);
      res.status(200).json({
        ...healthResponse,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        database: process.env.DATABASE_URL ? "configured" : "not configured",
        gemini: process.env.GEMINI_API_KEY ? "configured" : "not configured"
      });
    } else {
      clearTimeout(timeoutId);
      if (process.env.NODE_ENV === "production") {
        const clientBuildPath = path.join(__dirname, "../../dist/public");
        const indexPath = path.join(clientBuildPath, "index.html");
        res.sendFile(indexPath, (err) => {
          if (err) {
            console.error("Static file serve error:", err);
            const rootIndexPath = path.join(__dirname, "../../index.html");
            res.sendFile(rootIndexPath, (err2) => {
              if (err2) {
                res.status(200).json({
                  ...healthResponse,
                  message: "Static file error but server running",
                  timestamp: (/* @__PURE__ */ new Date()).toISOString()
                });
              }
            });
          }
        });
      } else {
        const rootIndexPath = path.join(__dirname, "../../index.html");
        res.sendFile(rootIndexPath, (err) => {
          if (err) {
            res.json({
              ...healthResponse,
              message: "Development server running",
              endpoints: ["/api/health", "/api/sefaria", "/api/gemini", "/api/books"],
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
        });
      }
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Root endpoint error:", error);
    if (!res.headersSent) {
      res.status(200).json({
        status: "ok",
        app: "Le Compagnon du C\u0153ur",
        error: "Non-critical error but server responsive",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        port: PORT
      });
    }
  }
});
app.get("/api/health", (req, res, next) => {
  const timeoutId = setTimeout(() => {
    if (!res.headersSent) {
      res.status(200).json({
        status: "ok",
        app: "Le Compagnon du C\u0153ur",
        message: "API health check timeout but server responsive",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        port: PORT
      });
    }
  }, 2500);
  try {
    clearTimeout(timeoutId);
    res.status(200).json({
      ...healthResponse,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      database: process.env.DATABASE_URL ? "configured" : "not configured",
      gemini: process.env.GEMINI_API_KEY ? "configured" : "not configured",
      api_endpoints: ["/api/sefaria", "/api/gemini", "/api/books"]
    });
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Health check error:", error);
    if (!res.headersSent) {
      res.status(200).json({
        status: "ok",
        app: "Le Compagnon du C\u0153ur",
        error: "Health check error but server running",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        port: PORT
      });
    }
  }
});
app.use("/api/sefaria", sefaria_default);
app.use("/api/gemini", gemini_default);
app.use("/api/books", books_default);
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../../dist/public");
  app.use(express.static(clientBuildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
} else {
  app.use(express.static(path.join(__dirname, "../..")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../index.html"));
  });
}
app.use(errorHandler);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`\u{1F680} Server running on port ${PORT}`);
  console.log(`\u{1F4CD} Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`\u{1F517} Health check: http://0.0.0.0:${PORT}/ and http://0.0.0.0:${PORT}/api/health`);
  console.log(`\u{1F310} Server accessible externally on 0.0.0.0:${PORT}`);
}).on("error", (err) => {
  console.error("\u274C Server startup error:", err);
  console.error("\u{1F4CA} Error details:", {
    code: err.code,
    port: PORT,
    message: err.message
  });
  process.exit(1);
});
