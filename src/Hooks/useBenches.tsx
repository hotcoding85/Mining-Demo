import { useCallback } from "react";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";

export const useBenches = () => {
  const { benches } = useSelector(
    createSelector(
      (state: any) => state,
      (state) => {
        return {
          benches: state.Benches.data,
        };
      }
    )
  );

  const findBenchesById = useCallback(
    (id) => benches.find((item) => item.id === id) || null,
    [benches]
  );

  return {
    benches,
    findBenchesById,
  };
};
