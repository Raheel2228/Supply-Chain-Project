import React, { useState, FormEvent, ChangeEvent } from "react";
import {
  Button,
  Classes,
  Dialog,
  RadioGroup,
  Radio,
  Callout,
  UL,
  Checkbox,
} from "@blueprintjs/core";
import { useAuthFetch, useApi } from "../util/api";
import { DatasetTypePrivilege } from "./DatasetTypes";
import { ClientPrivilege } from "./AdminClient";
import { PrivilegeLevel } from "./ClientPrivilegeLevelSelector";
import { UserLabel } from "../user/UserSelector";

interface IDatasetTypeRestrictionDialogProps {
  isOpen: boolean;
  onSave?: () => void;
  onClose?: (event?: React.SyntheticEvent<HTMLElement>) => void;
  clientId: string;
  datasetType: string;
  restricted: boolean;
}

export default function DatasetTypeRestrictionDialog({
  isOpen,
  onClose,
  onSave,
  clientId,
  datasetType,
  restricted,
}: IDatasetTypeRestrictionDialogProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const authFetch = useAuthFetch();
  const datasetTypePrivilegesQuery = useApi(
    `/datasetTypePrivileges/client/${clientId}/type/${datasetType}`
  );

  const clientPrivilegesQuery = useApi(`/clientPrivileges/${clientId}`);

  const datasetTypePrivileges: DatasetTypePrivilege[] =
    datasetTypePrivilegesQuery.data?.datasetTypePrivileges;

  const clientPrivileges: ClientPrivilege[] =
    clientPrivilegesQuery.data?.clientPrivileges;

  const changeRestricted = async (newRestricted: boolean) => {
    setLoading(true);
    try {
      if (!clientId || !datasetType) {
        throw new Error("Missing client ID or dataset type");
      }
      // Create or delete restriction
      const method = newRestricted ? "POST" : "DELETE";
      await authFetch(`/datasetTypeRestrictions/${clientId}/${datasetType}`, {
        method,
      });

      onSave && onSave();
    } catch (error) {
      setError(String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleUserPrivilegeChange = async (
    userId: string,
    privileged: boolean
  ) => {
    setLoading(true);
    try {
      if (!clientId || !datasetType) {
        throw new Error("Missing client ID or dataset type");
      }
      // Create or delete restriction
      const method = privileged ? "POST" : "DELETE";
      await authFetch(
        `/datasetTypePrivileges/${clientId}/${datasetType}/${userId}`,
        { method }
      );

      onSave && onSave();
      datasetTypePrivilegesQuery.fire();
    } catch (error) {
      setError(String(error));
    } finally {
      setLoading(false);
    }
  };

  const anyError =
    error || clientPrivilegesQuery.error || datasetTypePrivilegesQuery.error;

  return (
    <Dialog isOpen onClose={onClose} title={`${datasetType} Access Control`}>
      {anyError && <Callout intent="danger">{anyError}</Callout>}
      <div className={Classes.DIALOG_BODY}>
        <RadioGroup
          onChange={(e: FormEvent<HTMLInputElement>) =>
            changeRestricted(e.currentTarget.value === "yes")
          }
          selectedValue={restricted ? "yes" : "no"}
          disabled={loading}
        >
          <Radio
            label="Allow access to all registered users of this client workspace"
            value="no"
          />
          <br />
          <Radio
            label="Restrict access to client admins and specific users"
            value="yes"
          />
        </RadioGroup>
        {/* If restricted, then show a list of all users.
        Client admins are always checked and can’t be changed. */}
        {restricted && datasetTypePrivileges && clientPrivileges && (
          <UL style={{ listStyle: "none" }}>
            {clientPrivileges.map((clientPrivilege) => {
              const clientAdmin =
                clientPrivilege.privilegeLevel === PrivilegeLevel.CLIENT_ADMIN;
              const observer =
                clientPrivilege.privilegeLevel ===
                PrivilegeLevel.CLIENT_OBSERVER;
              const privileged =
                datasetTypePrivileges.filter(
                  (privilege) => privilege.userId === clientPrivilege.userId
                ).length > 0;
              return (
                <li key={clientPrivilege.userId}>
                  <Checkbox
                    disabled={
                      clientAdmin ||
                      observer ||
                      loading ||
                      datasetTypePrivilegesQuery.loading
                    }
                    checked={clientAdmin || privileged}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleUserPrivilegeChange(
                        clientPrivilege.userId,
                        e.target.checked
                      )
                    }
                    labelElement={<UserLabel user={clientPrivilege.user!} />}
                  />
                </li>
              );
            })}
          </UL>
        )}
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button type="button" onClick={onClose} loading={loading}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
