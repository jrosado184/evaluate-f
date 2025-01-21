import React, { useState } from "react";

const useNotifications = () => {
  const [successfullyAddedEmployee, setSuccessfullyAddedEmployee] =
    useState<boolean>(false); // Start as false
  return { successfullyAddedEmployee, setSuccessfullyAddedEmployee };
};

export default useNotifications;
