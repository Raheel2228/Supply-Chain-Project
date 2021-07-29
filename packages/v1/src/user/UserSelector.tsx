import React, { SyntheticEvent } from "react";
import { MenuItem, Button, Classes, Callout } from "@blueprintjs/core";
import { ItemPredicate, ItemRenderer, Select } from "@blueprintjs/select";
import { useApi } from "../util/api";
import { User } from "../admin/AdminUsers";
import { ClientPrivilege } from "../admin/AdminClient";

export const UserLabel = ({ user }: { user: User }) => (
  <span className="user-label">
    {user.name} <span className={Classes.TEXT_MUTED}>({user.email})</span>
  </span>
);

export const areUsersEqual = (a: User, b: User) => a.id === b.id;

export const userItemPredicate: ItemPredicate<User> = (query, user) =>
  user.name.toLowerCase().includes(query.toLowerCase()) ||
  user.email.toLowerCase().includes(query.toLowerCase());

const UserSelect = Select.ofType<User>();

interface UserSelectorProps {
  defaultLabel?: string;
  clientId: string;
  userId?: string;
  onChange?: (userId: string) => void;
  disabled?: boolean;
}

export default function UserSelector({
  defaultLabel = "Select user…",
  clientId,
  userId,
  onChange,
  disabled = false,
}: UserSelectorProps) {
  // Load users in this client
  const { data, error } = useApi(`/clientPrivileges/${clientId}`);

  if (error || !clientId)
    return <Callout intent="danger">Error loading users</Callout>;

  // Extract users from client privileges
  const clientPrivileges: ClientPrivilege[] = data?.clientPrivileges || [];
  const users: User[] = clientPrivileges.map((privilege) => privilege.user!);
  const selectedUser = users.find(({ id }) => id === userId);
  const emptyLabel = users.length === 0 ? "Loading…" : defaultLabel;

  const handleUserSelect = (
    user: User,
    event?: SyntheticEvent<HTMLElement>
  ) => {
    event?.preventDefault();
    event?.stopPropagation();

    // Send new user ID to parent
    onChange && onChange(user.id);
  };

  const renderUser: ItemRenderer<User> = (user, { modifiers, handleClick }) => {
    if (!modifiers.matchesPredicate) return null;
    return (
      <MenuItem
        key={user.id}
        active={modifiers.active}
        icon={userId === user.id ? "tick" : "blank"}
        onClick={handleClick}
        text={<UserLabel user={user} />}
        shouldDismissPopover
      />
    );
  };

  return (
    <UserSelect
      items={users}
      itemRenderer={renderUser}
      itemsEqual={areUsersEqual}
      itemPredicate={userItemPredicate}
      onItemSelect={handleUserSelect}
      noResults={<MenuItem disabled={true} text="No results." />}
      popoverProps={{ minimal: true, fill: true }}
      disabled={disabled}
    >
      <Button
        fill
        icon={"user"}
        disabled={disabled}
        text={selectedUser ? <UserLabel user={selectedUser} /> : emptyLabel}
        rightIcon="double-caret-vertical"
      />
    </UserSelect>
  );
}
