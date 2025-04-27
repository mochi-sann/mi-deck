import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";

describe("Breadcrumb", () => {
  it("should render the Breadcrumb component", () => {
    render(<Breadcrumb />);
    // Add assertions here
  });

  it("should render a full breadcrumb structure", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/components">Components</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    // Add assertions to check for the presence of rendered elements
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Components")).toBeInTheDocument();
    expect(screen.getByText("Breadcrumb")).toBeInTheDocument();
  });

  it("should render BreadcrumbEllipsis", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );
    // Add assertions to check for the presence of the ellipsis
    expect(screen.getByText("...")).toBeInTheDocument();
  });
});
