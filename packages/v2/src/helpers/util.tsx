export const searchSOP = (id: any, myArray: any) => {
  for (var i = 0; i < myArray.length; i++) {
    if (myArray[i].id === id) {
      return myArray[i];
    }
  }
};
export const getClientId = () => {
  //  @ts-ignore
  return JSON.parse(localStorage.getItem("clientData"))[0].clientId;
};
