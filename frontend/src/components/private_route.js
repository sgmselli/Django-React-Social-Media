import { useAuth } from "../contexts/useAuth";
import { Navigate } from "react-router-dom";
import { Text } from "@chakra-ui/react";

const PrivateRoute = ({children}) => {

    const { auth, authLoading } = useAuth();

    if (authLoading) {
        return <Text>Loading...</Text>
    }

    if (auth) {
        return children
    } else {
        return <Navigate to='/login' />
    }

}

export default PrivateRoute;