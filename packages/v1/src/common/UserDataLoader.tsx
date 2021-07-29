import React, { useEffect, useState } from "react";
import { useAuthFetch } from "../util/api";
import {
  atom,
  useRecoilValue,
  useSetRecoilState,
  useRecoilState,
} from "recoil";
import { ClientPrivilege } from "../admin/AdminClient";
import { User } from "../admin/AdminUsers";
import { PrivilegeLevel } from "../admin/ClientPrivilegeLevelSelector";
import useQueryParams from "../util/useQueryParams";
import { Client } from "../admin/AdminClients";
import { useAuth0 } from "@auth0/auth0-react";

type ClientPrivilegesHookResult = {
  loading: boolean;
  clientPrivileges: ClientPrivilege[];
};
const clientPrivilegesAtom = atom<ClientPrivilegesHookResult>({
  key: "clientPrivilegesAtom",
  default: { loading: true, clientPrivileges: [] },
});

type UserHookResult = {
  loading: boolean;
  user: User | undefined;
};
const userAtom = atom<UserHookResult>({
  key: "userAtom",
  default: { loading: true, user: undefined },
});
const adminModeAtom = atom<boolean>({
  key: "adminModeAtom",
  default: false,
});

export type UserState = {
  loading: boolean;
  adminMode: boolean;
  setAdminMode: (adminMode: boolean) => void;
  user: User | undefined;
  clientPrivileges: ClientPrivilege[];
  currentClient: Client | undefined;
  clientPrivilegeLevel: PrivilegeLevel | undefined;
};

// Expose hook to use these values without spreading dependency on Recoil
export const useUserState = (): UserState => {
  const { user, loading: userLoading } = useRecoilValue(userAtom);
  const { clientPrivileges, loading: clientPrivilegesLoading } = useRecoilValue(
    clientPrivilegesAtom
  );
  const { clientId } = useQueryParams();
  const [adminMode, setAdminMode] = useRecoilState(adminModeAtom);

  const [currentClientPrivilege] = clientPrivileges.filter(
    (privilege: ClientPrivilege) => clientId === privilege.clientId
  );

  return {
    loading: userLoading || clientPrivilegesLoading,
    adminMode,
    setAdminMode,
    user,
    clientPrivileges,
    currentClient: currentClientPrivilege?.client,
    clientPrivilegeLevel: currentClientPrivilege?.privilegeLevel,
  };
};

// Simple component to load the data into the recoil state
function UserLoader() {
  // Get user ID from Auth0
  const { isLoading, user } = useAuth0();
  const setUser = useSetRecoilState(userAtom);
  const setClientPrivileges = useSetRecoilState(clientPrivilegesAtom);

  // ErrorBoundary won’t catch errors from async code,
  // so save error in state and throw on render
  const [error, setError] = useState<any>();
  if (error) throw Error(error);

  const authFetch = useAuthFetch();
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setUser({ loading: false, user: undefined });
        setClientPrivileges({ loading: false, clientPrivileges: [] });
        return;
      }

      authFetch(`/users/${user.sub}`, {})
        .then((data: any) => {
          setUser({ loading: false, user: data.user });
        })
        .catch((error) => {
          console.error(error);
          setError("Error loading user profile");
        });

      authFetch("/clientPrivileges?includeClients=true", {})
        .then((data: any) => {
          //need to change after mvp
          localStorage.setItem(
            "clientData",
            JSON.stringify(data.clientPrivileges)
          );
          setClientPrivileges({
            loading: false,
            clientPrivileges: data.clientPrivileges,
          });
        })
        .catch((error) => {
          console.error(error);
          setError("Error loading user client privileges");
        });
    }
    // TODO figure out why including authFetch in here causes this to refetch on each route change
    // (Seemed to start occuring after auth0 upgrade? Or react-router v6)
  }, [authFetch, isLoading, setClientPrivileges, setUser, user]);

  return null;
}

// This wraps the individual loaders to prevent index.tsx from getting even more cluttered
export default function UserDataLoader() {
  return <UserLoader />;
}
