import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { localContent } from "@/content";
import { Experience } from "@/components/sections/experience/Experience";
import { ExperienceJourney } from "@/components/sections/experience/ExperienceJourney";
import { CompanyMark } from "@/components/sections/experience/CompanyMark";
import { contentWith, newJob } from "../../../support/content";

describe("experience tracker", () => {
  it("marks the role at the reading line, fills the progress line, and cleans up", () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback: FrameRequestCallback) => {
        callbacks.push(callback);
        return callbacks.length;
      }),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<Experience />);
    const items = Array.from(
      document.querySelectorAll<HTMLElement>(".timeline-item"),
    );
    const place = (active: number) =>
      items.forEach((item, i) => {
        const top = active === i ? 100 : i < active ? -1000 : 2000;
        item.getBoundingClientRect = () =>
          ({ top, bottom: top + 300, height: 300 }) as DOMRect;
      });
    const journey = document.querySelector<HTMLElement>(".experience-journey")!;
    journey.getBoundingClientRect = () =>
      ({ top: -200, bottom: 1000, height: 1200 }) as DOMRect;
    place(1);
    act(() => callbacks.shift()?.(0));
    expect(items[1]).toHaveAttribute("data-active");
    expect(items[0]).toHaveAttribute("data-reached");
    expect(items[2]).not.toHaveAttribute("data-reached");
    expect(
      Number(journey.style.getPropertyValue("--progress")),
    ).toBeGreaterThan(0);
    place(2);
    fireEvent.scroll(window);
    act(() => callbacks.shift()?.(0));
    expect(items[2]).toHaveAttribute("data-active");
    expect(items[1]).not.toHaveAttribute("data-active");
    fireEvent.resize(window);
    act(() => callbacks.shift()?.(0));
    expect(items[2]).toHaveAttribute("data-active");
    unmount();
    expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function));
    expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
  });
  it("bolds known tools inside role bullets without changing the text", () => {
    render(<Experience />);
    const bullet = screen.getByText(/Built and evaluated AIML pipelines/);
    expect(within(bullet).getByText("PyTorch").tagName).toBe("STRONG");
    expect(bullet).toHaveTextContent(
      "Built and evaluated AIML pipelines using PyTorch, Hugging Face Transformers, LoRA/PEFT",
    );
  });
  it("docks the pin at a company badge with an impact ripple, then lets it go", () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback: FrameRequestCallback) => callbacks.push(callback)),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    render(<Experience />);
    const journey = document.querySelector<HTMLElement>(".experience-journey")!;
    const pin = journey.querySelector<HTMLElement>(".timeline-cursor")!;
    const badges = Array.from(
      journey.querySelectorAll<HTMLElement>(".timeline-node"),
    );
    // A 1220px journey with 64px badges at 0, 400 and 800px; `top` scrolls.
    let top = 0;
    journey.getBoundingClientRect = () =>
      ({ top, bottom: top + 1220, height: 1220 }) as DOMRect;
    badges.forEach((badge, i) => {
      badge.getBoundingClientRect = () =>
        ({ top: top + i * 400, bottom: top + i * 400 + 64 }) as DOMRect;
    });
    const scrollTo = (next: number) => {
      top = next;
      fireEvent.scroll(window);
      act(() => callbacks.splice(0).forEach((callback) => callback(0)));
    };
    // The reading line is at 384px (jsdom's window is 768px tall).
    scrollTo(0);
    expect(pin).not.toHaveAttribute("data-docked");
    expect(badges.some((b) => b.hasAttribute("data-impact"))).toBe(false);
    // The tip reaches the second badge: the pin waits at its rim, the badge
    // ripples.
    scrollTo(-20);
    expect(pin).toHaveAttribute("data-docked");
    expect(journey.style.getPropertyValue("--cursor-y")).toBe("394.0px");
    expect(badges[1]).toHaveAttribute("data-impact");
    expect(badges[0]).not.toHaveAttribute("data-impact");
    // Past the badge, the pin rides the line again.
    scrollTo(-120);
    expect(pin).not.toHaveAttribute("data-docked");
    expect(
      parseFloat(journey.style.getPropertyValue("--cursor-y")),
    ).toBeGreaterThan(470);
  });
  it("survives an empty timeline", () => {
    render(<ExperienceJourney>No roles</ExperienceJourney>);
    expect(screen.getByText("No roles")).toBeVisible();
  });
});

describe("experience timeline", () => {
  it("shows each role newest first with its end year and badge", () => {
    render(<Experience />);
    const items = document.querySelectorAll(".timeline-item");
    expect(items).toHaveLength(localContent.experience.length);
    expect(
      Array.from(document.querySelectorAll(".timeline-year")).map(
        (y) => y.textContent,
      ),
    ).toEqual(["2025", "2021", "2021"]);
    // Apple's icon, then the TCS and Sparks logos.
    const marks = document.querySelectorAll(".company-mark");
    expect(marks[0].querySelector("svg")).not.toBeNull();
    expect(marks[1].querySelector("img")).toHaveAttribute(
      "src",
      "/images/brands/tcs.svg",
    );
    expect(marks[2].querySelector("img")).toHaveAttribute(
      "src",
      "/images/brands/sparks.png",
    );
  });

  it("adds a new role at the end with a default badge", () => {
    render(
      <Experience content={contentWith((c) => c.experience.push(newJob()))} />,
    );
    const last = Array.from(document.querySelectorAll(".timeline-item")).at(
      -1,
    )!;
    expect(
      within(last as HTMLElement).getByText("Northwind Labs"),
    ).toBeVisible();
    expect(last.querySelector(".timeline-year")).toHaveTextContent("2027");
    expect(last.querySelector(".company-mark svg")).not.toBeNull();
    // Its bullet bolds the tools from the skills list.
    expect(within(last as HTMLElement).getByText("PyTorch").tagName).toBe(
      "STRONG",
    );
  });

  it("draws a company badge from an icon, an image or a briefcase", () => {
    const { rerender, container } = render(
      <CompanyMark logo={{ icon: "spark" }} />,
    );
    expect(container.querySelector("svg")).not.toBeNull();
    rerender(<CompanyMark logo={{ src: "/images/brands/tcs.svg" }} />);
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
    rerender(<CompanyMark />);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });
});
