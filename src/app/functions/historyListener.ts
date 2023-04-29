import { useEffect } from "react";
import { useAppDispatch } from "../hooks";
import { changeLocation } from "../features/locationSlice";
import { useLocation } from "react-router-dom";

const useLocationListener = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  useEffect(() => {
    dispatch(changeLocation(location.pathname));
  }, [location.pathname, dispatch]);
};

export default useLocationListener;
