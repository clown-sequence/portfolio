import React from "react";
import { AboutMeSkeleton, ConnectSkeleton, ProjectSkeleton, TestimonialSkeleton } from "@/components/skeleton";
import { Projects } from "@/components/projects";
import { AboutMe } from "@/components/about-me";
import { Testimonials } from "@/components/testimonials";
import { Connect } from "@/components/connect";
import { BentoGrid } from "@/components/bento-grid";
import { BentoGridItems } from "@/components/bento-grid-items";
import type { PortfolioItem } from "@/types";

export default function Portfolio(): React.JSX.Element {
  const items: PortfolioItem[] = [
    {
      title: "projects",
      description: "creative design & development",
      header: <ProjectSkeleton />,
      className: "md:col-span-2",
      icon: <div className="h-4 w-4 rounded-full bg-white" />,
      content: <Projects />
    },
    {
      title: "about me",
      description: "want to know me more.",
      header: <AboutMeSkeleton />,
      className: "md:col-span-1",
      icon: <div className="h-4 w-4 rounded-full bg-white" />,
      content: <AboutMe />
    },
    {
      title: "testimonial",
      description: "know what others say about me.",
      header: <TestimonialSkeleton />,
      className: "md:col-span-1",
      icon: <div className="h-4 w-4 rounded-full bg-white" />,
      content: <Testimonials />
    },
    {
      title: "connect",
      description: "tell me more about your design and logic, let's connect",
      header: <ConnectSkeleton />,
      className: "md:col-span-2",
      icon: <div className="h-4 w-4 rounded-full bg-white" />,
      content: <Connect />
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-8 transition-colors duration-200">
      <BentoGrid>
        {items.map((item: PortfolioItem, i: number) => (
          <BentoGridItems
            key={i}
            title={item.title}
            description={item.description}
            header={item.header}
            content={item.content}
            className={item.className}
          />
        ))}
      </BentoGrid>
    </div>
  );
}