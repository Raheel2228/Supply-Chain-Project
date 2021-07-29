import React from "react";
import { renderWithRouter, screen } from "../testUtils";
import Nav from "./Nav";
import { UserState, useUserState } from "../common/UserDataLoader";
import { PrivilegeLevel } from "../admin/ClientPrivilegeLevelSelector";

jest.mock("../common/UserDataLoader");

let userState: Partial<UserState>;

beforeEach(() => {
  // Set up initial mock data that can be modified in each test
  userState = {
    loading: false,
    user: {
      id: "auth0BogusUser",
      globalAdmin: false,
      name: "Jane Doe",
      contactEmail: null,
      email: "jane@example.com",
    },
    clientPrivilegeLevel: PrivilegeLevel.CLIENT_USER,
  };

  useUserState.mockImplementation(() => userState);
});

function expectLink(text: string, href: string) {
  expect(screen.getByText(text).closest("a")).toHaveAttribute("href", href);
}

test("renders nothing if user is missing", () => {
  userState.user = undefined;
  renderWithRouter(<Nav />, "/");
  expect(screen.queryAllByRole("link")).toHaveLength(0);
});

test("renders nothing if client ID is missing and user is not gloal admin", () => {
  userState.user!.globalAdmin = false;
  renderWithRouter(<Nav />, "/");
  expect(screen.queryAllByRole("link")).toHaveLength(0);
});

test("renders global admin links if user is global admin and not in client", () => {
  userState.user!.globalAdmin = true;
  renderWithRouter(<Nav />, "/admin");
  expectLink("Clients", "/admin/clients");
  expectLink("Scripts", "/admin/scripts");
  expectLink("Users", "/admin/users");
});

test("does not render global admin links if user is global admin and in client", () => {
  userState.user!.globalAdmin = true;
  renderWithRouter(<Nav />, "/models?clientId=asdf");
  expect(screen.queryByText("Clients")).not.toBeInTheDocument();
  expect(screen.queryByText("Scripts")).not.toBeInTheDocument();
  // Users link should not go to global users (but there’s a workspace users link)
  expect(screen.queryByText("Users")).not.toHaveAttribute(
    "href",
    "/admin/users"
  );
});

test("renders client links if regular user is in client", () => {
  renderWithRouter(<Nav />, "/models?clientId=asdf");
  expectLink("Models", "/models?clientId=asdf");
  expectLink("Reports", "/reports?clientId=asdf");
  expectLink("Datasets", "/datasets?clientId=asdf");
});

test("does not render client admin links if regular user is in client", () => {
  renderWithRouter(<Nav />, "/models?clientId=asdf");
  expect(screen.queryByText("Workspace Users")).not.toBeInTheDocument();
  expect(screen.queryByText("Dataset Types")).not.toBeInTheDocument();
});

test("renders client and client admin links if client admin is in client", () => {
  userState.clientPrivilegeLevel = PrivilegeLevel.CLIENT_ADMIN;
  renderWithRouter(<Nav />, "/models?clientId=asdf");
  expectLink("Models", "/models?clientId=asdf");
  expectLink("Reports", "/reports?clientId=asdf");
  expectLink("Datasets", "/datasets?clientId=asdf");
  expectLink("Users", "/users?clientId=asdf");
  expectLink("Dataset Types", "/datasetTypes?clientId=asdf");
});

test("renders nothing if observer is in client", () => {
  userState.clientPrivilegeLevel = PrivilegeLevel.CLIENT_OBSERVER;
  renderWithRouter(<Nav />, "/models?clientId=asdf");
  expect(screen.queryAllByRole("link")).toHaveLength(0);
});
