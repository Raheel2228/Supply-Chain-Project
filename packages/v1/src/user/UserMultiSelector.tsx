import React, { useState, useEffect, SyntheticEvent } from "react";
import { Callout, MenuItem } from "@blueprintjs/core";
import { ItemRenderer, MultiSelect } from "@blueprintjs/select";
import { useApi } from "../util/api";
import { User } from "../admin/AdminUsers";
import { ClientPrivilege } from "../admin/AdminClient";
import { areUsersEqual, userItemPredicate, UserLabel } from "./UserSelector";

const UserMultiSelect = MultiSelect.ofType<User>();

interface UserMultiSelectorProps {
  label?: string;
  clientId: string;
  onChange?: (userIds: string[]) => void;
  defaultValue?: string[];
  // TODO consider filtering by privilege level
}

export default function UserMultiSelector({
  label = "Select users…",
  clientId,
  onChange,
  defaultValue = [],
}: UserMultiSelectorProps) {
  const [userIds, setUserIds] = useState<string[]>(defaultValue);

  // Load users in this client
  const { data, error } = useApi(`/clientPrivileges/${clientId}`);

  // Send new user selection to parent
  useEffect(() => {
    onChange && onChange(userIds);
  }, [onChange, userIds]);

  if (error || !clientId)
    return <Callout intent="danger">Error loading users</Callout>;

  // Extract users from client privileges
  const clientPrivileges: ClientPrivilege[] = data?.clientPrivileges || [];
  const allUsers: User[] = clientPrivileges.map((privilege) => privilege.user!);

  // Find Users for currently-selected user IDs
  const selectedUsers: User[] = [];
  for (const userId of userIds) {
    const selected = allUsers.find(({ id }) => id === userId);
    if (selected) selectedUsers.push(selected);
  }

  const handleUserSelect = (
    user: User,
    event?: SyntheticEvent<HTMLElement>
  ) => {
    event?.preventDefault();
    event?.stopPropagation();

    const userIndex = userIds.indexOf(user.id);
    if (userIndex === -1) {
      setUserIds([...userIds, user.id]);
    } else {
      setUserIds(userIds.filter((_userId) => user.id !== _userId));
    }
  };

  const handleUserRemove = (tagValue: any, index: number) => {
    setUserIds(userIds.filter((_user, i) => i !== index));
  };

  const renderUser: ItemRenderer<User> = (user, { modifiers, handleClick }) => {
    if (!modifiers.matchesPredicate) return null;
    return (
      <MenuItem
        active={modifiers.active}
        icon={userIds.includes(user.id) ? "tick" : "blank"}
        key={user.id}
        onClick={handleClick}
        text={<UserLabel user={user} />}
        shouldDismissPopover={false}
      />
    );
  };

  return (
    <UserMultiSelect
      fill
      itemPredicate={userItemPredicate}
      itemRenderer={renderUser}
      itemsEqual={areUsersEqual}
      items={allUsers || []}
      noResults={<MenuItem disabled={true} text="No results." />}
      onItemSelect={handleUserSelect}
      popoverProps={{ minimal: true }}
      tagRenderer={(user) => user.name}
      scrollToActiveItem
      tagInputProps={{
        leftIcon: "user",
        onRemove: handleUserRemove,
      }}
      placeholder={label}
      selectedItems={selectedUsers}
      resetOnSelect
    />
  );
}
