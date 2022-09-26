import { Grid } from '@mui/material';
import { Link, useNavigate } from "react-router-dom"

export default function Footer(props) {
    const navigate = useNavigate();

    return (
        <Grid container alignItems='center' justifyContent='center' className="bg-light-gray py-2">
            <Grid item>
                <span className="text-dark-gray mx-4" onClick={(_) => navigate(RoutPath.MainPage)}>Admin</span>
            </Grid>
            <Grid item>
                <span className="text-dark-gray mx-4">FAQ</span>
            </Grid>
            <Grid item>
                <span className="text-dark-gray mx-4">Open Responsibly</span>
            </Grid>
        </Grid>
    )
}