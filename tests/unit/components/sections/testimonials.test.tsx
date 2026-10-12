import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Testimonials } from "@/components/sections/testimonials/Testimonials";
import { contentWith, newTestimonial } from "../../../support/content";

describe("recommendations", () => {
  it("renders authentic recommendation portraits and manual controls", async () => {
    render(<Testimonials />);
    expect(screen.getAllByRole("img")).toHaveLength(2);
    await userEvent.click(
      screen.getByRole("button", { name: "Next recommendation" }),
    );
    expect(screen.getByText("2 / 2")).toBeVisible();
    await userEvent.click(
      screen.getByRole("button", { name: "Previous recommendation" }),
    );
    expect(screen.getByText("1 / 2")).toBeVisible();
    fireEvent.keyDown(screen.getByRole("region", { name: "Recommendations" }), {
      key: "ArrowLeft",
    });
    expect(screen.getByText("2 / 2")).toBeVisible();
  });
  it("adds a new recommendation to the carousel", () => {
    render(
      <Testimonials
        content={contentWith((c) => c.testimonials.push(newTestimonial()))}
      />,
    );
    expect(screen.getAllByRole("img")).toHaveLength(3);
    expect(screen.getByText("1 / 3")).toBeVisible();
  });

  it("hides the section when there are none", () => {
    const { container } = render(
      <Testimonials content={contentWith((c) => (c.testimonials = []))} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
