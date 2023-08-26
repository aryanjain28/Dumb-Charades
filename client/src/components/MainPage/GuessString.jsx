import { Typography } from "@mui/material";

const GuessString = ({ movie }) => {
  return (
    <Typography letterSpacing={1} variant="h5">
      {movie}
    </Typography>
  );
};

export default GuessString;
