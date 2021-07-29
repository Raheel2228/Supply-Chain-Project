import React from "react";
import { useHistory } from "react-router";
import { Callout, Button } from "@blueprintjs/core";
import { useUserState } from "../common/UserDataLoader";
import useQueryParams from "../util/useQueryParams";

export default function AdminClientViewCallout() {
  const history = useHistory();
  const { clientId } = useQueryParams();

  const { loading, user } = useUserState();

  if (loading || !user?.globalAdmin) return null;

  return (
    <Callout title="Viewing as Client" className="admin-client-view-callout">
      <Button
        minimal
        icon="chevron-left"
        text="Global admin view"
        intent="primary"
        onClick={() => history.push(`/admin/clients/${clientId}`)}
      />
    </Callout>
  );
}
