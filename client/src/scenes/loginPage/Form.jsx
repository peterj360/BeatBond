import { Box, Button, TextField, useMediaQuery, Typography, useTheme } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogin } from "state";
import axios from "axios";

const loginSchema = yup.object().shape({
    email: yup.string().email("invalid email").required("required"),
    password: yup.string().required("required"),
});

const initialValuesLogIn = {
    email: "",
    password: "",
}

const Form = () => {
    const { palette } = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isNonMobile = useMediaQuery("(min-width:600px)");
    const BASE_URL = process.env.REACT_APP_BEATBOND_API_BASE_URL;

    const login = async (values, onSubmitProps) => {
        let response;
        try {
            response = await axios.post(
                `${BASE_URL}/auth/login`,
                values,
                { headers: { "Content-Type" : "application/json" } }
            );
        } catch (error) {
            if (error.response) {
                console.error(error.response.data);
                console.error(error.response.status);
            } else if (error.request) {
                console.error(error.request);
            } else {
                console.error('Error', error.message);
            }
            throw error;
        }
        
        const loggedIn = await response.data;
        onSubmitProps.resetForm();
        if (loggedIn) {
            dispatch(
                setLogin({
                    user: loggedIn.user,
                    token: loggedIn.token,
                })
            );
            navigate("/home");
        }
    }

    const handleFormSubmit = async (values, onSubmitProps) => {
        await login(values, onSubmitProps);
    };

    return (
        <Formik onSubmit={handleFormSubmit} initialValues={ initialValuesLogIn} validationSchema={loginSchema}>
            {({
                values,
                errors,
                touched,
                handleBlur,
                handleChange,
                handleSubmit,
                setFieldValue,
                resetForm,
            }) => (
                <form onSubmit={handleSubmit}>
                    <Box display="grid" gap="30px" gridTemplateColumns="repeat(4, minmax(0, 1fr))" sx={{"& > div": {gridColumn: isNonMobile ? undefined : "span 4"}}}>
                        <TextField 
                            label="Email"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.email}
                            name="email"
                            error={Boolean(touched.email) && Boolean(errors.email)}
                            helperText={touched.email && errors.email}
                            sx={{gridColumn: "span 4"}}
                        />
                        <TextField 
                            label="Password"
                            type="password"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.password}
                            name="password"
                            error={Boolean(touched.password) && Boolean(errors.password)}
                            helperText={touched.password && errors.password}
                            sx={{gridColumn: "span 4"}}
                        />
                    </Box>

                    <Box>
                        <Button fullWidth type="submit" sx={{textTransform: 'none', m: "2rem 0", p:"!rem", backgroundColor: palette.primary.main, color: palette.background.switch, "&hover": {color: palette.primary.main}}}>
                            Login
                        </Button>
                        <Typography 
                            onClick={() => navigate('/signup')}
                            sx={{
                                textDecoration: "underline",
                                color: palette.primary.main,
                                "&:hover": {cursor: 'pointer', color: palette.primary.light}
                            }}
                        >
                            Don't have an account? Sign Up here.
                        </Typography>
                    </Box>
                </form>
            )}
        </Formik>
    )
}

export default Form;
