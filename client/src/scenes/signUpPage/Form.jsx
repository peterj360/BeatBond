import { Box, Button, TextField, useMediaQuery, Typography, useTheme } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import Dropzone from "react-dropzone";
import FlexBetween from "components/FlexBetween";
import axios from "axios";

const signUpSchema = yup.object().shape({
    firstName: yup.string().required("required"),
    lastName: yup.string().required("required"),
    email: yup.string().email("invalid email").required("required"),
    username: yup.string().required("required"),
    password: yup.string().required("required"),
});

const initialValuesSignUp = {
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    picture: "",
}

const Form = () => {
    const { palette } = useTheme();
    const navigate = useNavigate();
    const isNonMobile = useMediaQuery("(min-width:600px)");
    const BASE_URL = process.env.REACT_APP_BEATBOND_API_BASE_URL;

    const signUp = async (values, onSubmitProps) => {
        const formData = new FormData();
        for (let value in values) {
            formData.append(value, values[value]);
        }
        if (values.picture) {
            formData.append('picturePath', values.picture.name);
        }
        let response;
        try {
            response = await axios.post(`${BASE_URL}/auth/signup`, formData);
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

        const savedUser = await response.data;
        onSubmitProps.resetForm();
        if (savedUser) {
            navigate('/login')
        }
    };

    const handleFormSubmit = async (values, onSubmitProps) => {
        await signUp(values, onSubmitProps)
    };

    return (
        <Formik onSubmit={handleFormSubmit} initialValues={initialValuesSignUp} validationSchema={signUpSchema}>
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
                            label="First Name"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.firstName}
                            name="firstName"
                            error={Boolean(touched.firstName) && Boolean(errors.firstName)}
                            helperText={touched.firstName && errors.firstName}
                            sx={{gridColumn: "span 2"}}
                        />
                        <TextField 
                            label="Last Name"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.lastName}
                            name="lastName"
                            error={Boolean(touched.lastName) && Boolean(errors.lastName)}
                            helperText={touched.lastName && errors.lastName}
                            sx={{gridColumn: "span 2"}}
                        />
                        <TextField 
                            label="Username"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.username}
                            name="username"
                            error={Boolean(touched.username) && Boolean(errors.username)}
                            helperText={touched.username && errors.username}
                            sx={{gridColumn: "span 4"}}
                        />
                        <Box gridColumn="span 4" border={`1px solid ${palette.neutral.medium}`} borderRadius="5px" p="1rem">
                            <Dropzone acceptedFiles=".jpg,.jpeg,.png" multiple={false} onDrop={(acceptedFiles) => setFieldValue("picture", acceptedFiles[0])}>
                                {({ getRootProps, getInputProps }) => (
                                    <Box {...getRootProps()} border={`2px dashed ${palette.primary.main}`} p="1rem" sx={{"&:hover": {cursor: "pointer"}}}>
                                        <input {...getInputProps()}/>
                                        {!values.picture ? (
                                            <p>Add Picture Here</p>
                                        ) : (
                                            <FlexBetween>
                                                <Typography>{values.picture.name}</Typography>
                                                <EditOutlinedIcon/>
                                            </FlexBetween>
                                        )}
                                    </Box>
                                )}
                            </Dropzone>
                        </Box>

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
                        <Button fullWidth type="submit" sx={{textTransform: 'none', m: "2rem 0", backgroundColor: palette.primary.main, color: palette.background.switch, "&hover": {color: palette.primary.main}}}>
                            Sign up
                        </Button>
                        <Typography 
                            onClick={() => navigate('/login')}
                            sx={{
                                textDecoration: "underline",
                                color: palette.primary.main,
                                "&:hover": {cursor: "pointer", color: palette.primary.light}
                            }}
                        >
                            Already have an account? Login here.
                        </Typography>
                    </Box>
                </form>
            )}
        </Formik>
    )
}

export default Form;
