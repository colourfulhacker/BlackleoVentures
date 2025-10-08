import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { 
  pitchPracticeRequestSchema, 
  equityCalculationRequestSchema 
} from "@shared/schema";
import { generateInvestorResponse, calculateEquityDilution, analyzePitchDeck } from "./gemini";

// Configure multer for file uploads (memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.ms-powerpoint' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and PPT files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Pitch Practice AI endpoint
  app.post("/api/pitch-practice", async (req, res) => {
    try {
      const validated = pitchPracticeRequestSchema.parse(req.body);
      
      const investorResponse = await generateInvestorResponse(
        validated.message,
        validated.conversationHistory
      );

      res.json({ 
        success: true, 
        response: investorResponse 
      });
    } catch (error: any) {
      console.error("Pitch practice error:", error);
      
      // Differentiate between validation and server errors
      if (error.name === 'ZodError') {
        res.status(400).json({ 
          success: false, 
          error: "Invalid request format" 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: error.message || "Failed to generate investor response. Please try again." 
        });
      }
    }
  });

  // Equity Dilution Calculator endpoint
  app.post("/api/equity-calculator", async (req, res) => {
    try {
      const validated = equityCalculationRequestSchema.parse(req.body);
      
      const result = calculateEquityDilution(
        validated.currentOwnership,
        validated.fundraisingAmount,
        validated.preMoneyValuation
      );

      res.json({ 
        success: true, 
        result 
      });
    } catch (error: any) {
      console.error("Equity calculation error:", error);
      
      // Differentiate between validation and calculation errors
      if (error.name === 'ZodError') {
        res.status(400).json({ 
          success: false, 
          error: "Please enter valid numbers for all fields" 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: error.message || "Failed to calculate equity dilution. Please try again." 
        });
      }
    }
  });

  // Pitch Deck Audit endpoint
  app.post("/api/pitch-deck-audit", upload.single('pitchDeck'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: "Please upload a pitch deck file (PDF or PPT)" 
        });
      }

      let deckContent = '';

      // Extract text from PDF
      if (req.file.mimetype === 'application/pdf') {
        const pdfParse = (await import('pdf-parse')).default;
        const pdfData = await pdfParse(req.file.buffer);
        deckContent = pdfData.text;
      } 
      // For PPT files, we'll use the raw text extraction (limited support)
      else {
        deckContent = req.file.buffer.toString('utf-8');
      }

      if (!deckContent || deckContent.trim().length < 100) {
        return res.status(400).json({ 
          success: false, 
          error: "Could not extract sufficient content from the file. Please ensure your deck contains text content." 
        });
      }

      // Analyze with Gemini
      const auditResult = await analyzePitchDeck(deckContent);

      res.json({ 
        success: true, 
        result: auditResult 
      });
    } catch (error: any) {
      console.error("Pitch deck audit error:", error);
      
      // Check if it's a rate limit error
      if (error.message?.includes('429') || error.message?.includes('rate limit') || error.message?.includes('quota')) {
        return res.status(429).json({ 
          success: false, 
          error: "Our system is currently overloaded due to high demand. Please contact our team at +91 7837059633 and we'll help you get your audit results." 
        });
      }

      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to analyze pitch deck. Please try again." 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
