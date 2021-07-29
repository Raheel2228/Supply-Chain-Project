import React from "react";
import AdminClientUsers from "./AdminClientUsers";
import useQueryParams from "../util/useQueryParams";

export default function Users() {
  const { clientId } = useQueryParams();

  return <AdminClientUsers clientId={clientId!} />;
}
