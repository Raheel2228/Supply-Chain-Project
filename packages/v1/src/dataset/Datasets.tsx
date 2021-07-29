import React from "react";
import { Breadcrumbs, IBreadcrumbProps } from "@blueprintjs/core";
import useQueryParams from "../util/useQueryParams";
import DatasetList from "./DatasetList";
import { Helmet } from "react-helmet-async";
import { routerBreadcrumbRenderer } from "../nav/RouterBreadcrumb";
import { clientPath } from "../util/route";

export default function Datasets() {
  const { clientId } = useQueryParams();

  const BREADCRUMBS: IBreadcrumbProps[] = [
    { href: clientPath(clientId!, "datasets"), text: "Datasets", current: true },
  ];

  return (
    <>
      <Helmet>
        <title>Datasets</title>
      </Helmet>
      <div className="breadcrumb-wrapper">
        <Breadcrumbs
          items={BREADCRUMBS}
          breadcrumbRenderer={routerBreadcrumbRenderer}
        />
      </div>
      <DatasetList clientId={clientId!} />
    </>
  );
}
