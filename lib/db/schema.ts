import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
} from "drizzle-orm/pg-core";

export const domains = pgTable("domains", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  arxivCategories: text("arxiv_categories").array().notNull(),
  keywords: text("keywords").array().notNull(),
  papersToShow: integer("papers_to_show").notNull().default(4),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const briefs = pgTable("briefs", {
  id: serial("id").primaryKey(),
  weekStart: date("week_start").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  status: text("status").notNull().default("running"), // running | completed | failed
  papersScanned: integer("papers_scanned").notNull().default(0),
  runSummary: jsonb("run_summary"),
});

export const papers = pgTable("papers", {
  id: serial("id").primaryKey(),
  arxivId: text("arxiv_id").notNull().unique(),
  title: text("title").notNull(),
  authors: text("authors").array().notNull(),
  abstract: text("abstract").notNull(),
  url: text("url").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  hfUpvotes: integer("hf_upvotes"),
});

export const briefItems = pgTable("brief_items", {
  id: serial("id").primaryKey(),
  briefId: integer("brief_id")
    .notNull()
    .references(() => briefs.id, { onDelete: "cascade" }),
  paperId: integer("paper_id")
    .notNull()
    .references(() => papers.id, { onDelete: "cascade" }),
  domainId: integer("domain_id")
    .notNull()
    .references(() => domains.id, { onDelete: "cascade" }),
  significanceScore: integer("significance_score").notNull(),
  selectionReason: text("selection_reason").notNull(),
  summary: text("summary").notNull(),
  whyItMatters: text("why_it_matters").notNull(),
  priority: text("suggestion").notNull(), // low | medium | high — AI-suggested, Kavita-editable
  isSelected: boolean("is_selected").notNull().default(false),
});

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  paperId: integer("paper_id")
    .notNull()
    .references(() => papers.id, { onDelete: "cascade" }),
  tags: text("tags").array().notNull().default([]),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
