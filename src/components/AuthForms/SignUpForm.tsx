import { memo, lazy, Suspense } from "react";
import { IconButton, Modal, Paper } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { hideSignUpForm } from "../../app/features/UISlice";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgressComponent from "../CircularProgress";

const SignUpForm = memo(() => {
  const CreateAccountForm = lazy(() => import("./CreateAccountForm"));
  const InitialSignUpForm = lazy(() => import("./InitialSignUpForm"));

  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.UI.isSignUpFormShowing);
  const showInitialSignUpForm = useAppSelector(
    (state) => state.UI.isInitialSignUpFormShowing
  );
  const showCreateAccountForm = useAppSelector(
    (state) => state.UI.isCreateAccountFormShowing
  );

  return (
    <Modal open={open}>
      <Paper
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: "15px",
          width: "500px",
          height: "550px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Suspense fallback={<CircularProgressComponent />}>
          <IconButton
            onClick={() => dispatch(hideSignUpForm())}
            sx={{ position: "absolute", top: 10, left: 10 }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          {showInitialSignUpForm && <InitialSignUpForm />}
          {showCreateAccountForm && <CreateAccountForm />}
        </Suspense>
      </Paper>
    </Modal>
  );
});

export default SignUpForm;
