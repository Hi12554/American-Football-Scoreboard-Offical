import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { gameStateSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/game-state", async (req, res) => {
    try {
      const gameState = await storage.getGameState();
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to get game state" });
    }
  });

  app.patch("/api/game-state", async (req, res) => {
    try {
      const updates = req.body;
      const gameState = await storage.updateGameState(updates);
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to update game state" });
    }
  });

  app.post("/api/game-state/reset", async (req, res) => {
    try {
      const gameState = await storage.resetGameState();
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to reset game state" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
