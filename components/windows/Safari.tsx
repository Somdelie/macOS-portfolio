/* eslint-disable @next/next/no-img-element */
"use client";

import WindowWrapper from "@/hoc/WindowWrapper";
import WindowControlls from "../common/WindowControlls";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  MoveRight,
  PanelLeft,
  Plus,
  Search,
  Share,
  ShieldHalf,
} from "lucide-react";
import { blogPosts } from "@/constants";

const Safari = () => {
  return (
    <>
      <div id="window-header">
        <WindowControlls target="safari" />
        <PanelLeft size={20} className="ml-10 icon" />
        <div className="flex items-center gap-1 ml-5">
          <ChevronLeft size={20} className="icon" />
          <ChevronRight size={20} className="icon" />
        </div>
        <div className="flex-1 flex-center gap-3">
          <ShieldHalf size={20} className="icon" />

          <div className="search">
            <Search size={20} className="icon" />
            <input
              type="text"
              placeholder="Search or enter website name"
              className="flex-1"
            />
          </div>
        </div>
        <div className="flex items-center gap-5">
          <Share size={20} className="icon" />
          <Plus size={20} className="icon" />
          <Copy size={20} className="icon" />
        </div>
      </div>
      <div className="blog">
        <h2>My Developer Blog</h2>

        <div className="space-y-8">
          {blogPosts.map(({ id, image, title, date, link }) => (
            <div key={id} className="blog-post">
              <div className="col-span-2">
                <img src={image} alt={title} />
              </div>
              <div className="content">
                <p>{date}</p>
                <h3>{title}</h3>
                <a href={link} target="_blank" rel="noopener noreferrer">
                  Check out the full article{" "}
                  <MoveRight size={20} className="icon-hover" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const SafariWindow = WindowWrapper(Safari, "safari");

export default SafariWindow;
