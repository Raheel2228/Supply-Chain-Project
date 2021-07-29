// Modified from https://testing-library.com/docs/react-testing-library/setup/#custom-render
import React from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { RecoilRoot } from "recoil";
import { MemoryRouter, Router } from "react-router";
import { createMemoryHistory } from "history";

const Providers = ({ children }: { children: React.ReactElement }) => {
  return (
    <RecoilRoot>
      <MemoryRouter>{children}</MemoryRouter>
    </RecoilRoot>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "queries">
): RenderResult =>
  render(ui, { wrapper: Providers as React.ComponentType, ...options });

export const renderWithRouter = (ui: React.ReactElement, route = "/") => {
  const history = createMemoryHistory();
  history.push(route);

  return render(<Router history={history}>{ui}</Router>);
};

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };
