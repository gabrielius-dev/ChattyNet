import { memo, lazy, Suspense } from "react";
import {
  IconButton,
  Link,
  Modal,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { hideSignUpForm, showLogInForm } from "../../app/features/UISlice";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgressComponent from "../CircularProgress";

const SignUpForm = memo(() => {
  const CreateAccountForm = lazy(() => import("./CreateAccountForm"));
  const InitialSignUpForm = lazy(() => import("./InitialSignUpForm"));

  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.UI.isSignUpFormShowing);
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
          {!showCreateAccountForm && <InitialSignUpForm />}
          {showCreateAccountForm && <CreateAccountForm />}
          <Stack direction="row" mt={5} spacing={1}>
            <Typography variant="body1">Have an account already?</Typography>
            <Link
              component="button"
              underline="hover"
              onClick={() => {
                dispatch(hideSignUpForm());
                dispatch(showLogInForm());
              }}
            >
              Log in
            </Link>
          </Stack>
        </Suspense>
      </Paper>
    </Modal>
  );
});

export default SignUpForm;
