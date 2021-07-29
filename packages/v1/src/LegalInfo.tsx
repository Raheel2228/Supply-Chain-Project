import React from "react";
import licenseJson from "./licenses.json";
import { H2, HTMLTable } from "@blueprintjs/core";

type License = {
  licenses: string;
  repository: string;
  licenseUrl: string;
  parents: string;
};
type LicenseMap = {
  [key: string]: Partial<License>;
};

const licenses: LicenseMap = licenseJson;

export default function LegalInfo() {
  return (
    <section className="container section content">
      <H2>Open Source Acknowledgements</H2>
      <p>This application makes use of the following open source projects:</p>
      {/* To update this table, run `npn run update-licenses` in the repository root directory. */}
      <HTMLTable striped>
        <thead>
          <tr>
            <th>Project</th>
            <th>License</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(licenses).map((dep) => (
            <tr>
              <td>
                <a href={licenses[dep].repository}>{dep}</a>
              </td>
              <td>
                <a href={licenses[dep].licenseUrl}>{licenses[dep].licenses}</a>
              </td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
    </section>
  );
}
